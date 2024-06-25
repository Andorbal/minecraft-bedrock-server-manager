import { exec } from "child_process";
import { join } from "path";
import { getAll } from "./worlds.mjs";
import { copyScripts as copyServerScripts } from "##/utilities/copyScripts.mjs";
import { readConfigData } from "##/utilities/readConfigData.mjs";
import { readdir, readFile, mkdir, stat, writeFile, cp } from "fs/promises";
import snakeCase from "##/utilities/snakeCase.mjs";
import config from "##/routes/servers/config.mjs";

const bedrockConnectRoot = process.env.MINECRAFT_CONNECT_ROOT;
const minecraftServerHost = process.env.MINECRAFT_SERVER_HOST;
const minecraftServerRoot = process.env.MINECRAFT_SERVER_ROOT;

if (!minecraftServerRoot) {
  throw new Error("MINECRAFT_SERVER_ROOT environment variable is not set");
}

const validValues = (details) => {
  switch (details.type) {
    case "select":
      return "Valid values are: " + details.options.join(", ");
    case "number":
      return `Valid values are numbers between ${details.minimum || "min integer"} and ${
        details.maximum || "max integer"
      }`;
    case "boolean":
      return "Valid values are true and false";
    default:
      return "Valid values are string";
  }
};

const buildComment = (details) => {
  if (details.comment) {
    return details.comment;
  }

  return ["# " + details.description, "# " + validValues(details)].join("\n");
};

const readProperties = async (serverPath) => {
  try {
    await stat(serverPath);
    const propertyData = await readFile(join(serverPath, "server.properties"));

    const propertyItems = propertyData
      .toString()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .map((line) => line.split("=").map((item) => item.trim()));

    return Object.fromEntries(propertyItems);
  } catch (err) {
    console.error(err);
    return { error: err };
  }
};

const isRunning = (id) => () =>
  new Promise((resolve, reject) => {
    const command = `screen -list | grep -q ".${id}"`;
    exec(command, { shell: "/bin/bash" }, (error, stdout, stderr) => {
      if (error) {
        resolve(error.code === 0);
        return;
      } else {
        resolve(true);
      }
    });
  });

const isServiceEnabled = (id) => () =>
  new Promise((resolve, reject) => {
    const command = `systemctl is-enabled minecraft.${id}.service`;
    exec(command, { shell: "/bin/bash" }, (error, stdout, stderr) => {
      if (error) {
        console.dir(error);
        resolve(false);
        return;
      } else if (stderr) {
        console.log(`stderr: ${stderr}`);
        resolve(false);
      } else {
        const result = stdout.trim();
        console.log(result);
        resolve(result === "enabled");
      }
    });
  });

/** Get the path of the server
 * @param server {string} Id of the server
 * @returns {string} Full path of the server
 */
export const getPath = (server) => {
  const serverPath = join(minecraftServerRoot, server);

  if (!serverPath.startsWith(minecraftServerRoot)) {
    throw new Error("Resolved path does not start with base path");
  }

  return serverPath;
};

/** Get a list of servers
 * @returns {Promise<string[]>} List of server ids
 */
export const listServers = () => readdir(minecraftServerRoot);

/** Create a new server with the given params */
export const createServer = async (params) => {
  const id = snakeCase(params["server-name"]);
  const serverPath = getPath(id);

  try {
    await stat(serverPath);
    throw new Error("Server already exists");
  } catch {}

  console.log(serverPath);

  await mkdir(serverPath, { recursive: true });

  const serverProperties = config
    .flatMap((details) => {
      console.log(details.key);

      const value = params[details.key] || details.defaultValue;

      return [`${details.key}=${value}`, buildComment(details), ""];
    })
    .join("\n");

  writeFile(join(serverPath, "server.properties"), serverProperties);

  const server = await getServer(id);

  await server.copyScripts();
  await server.enable();
  await server.updateBedrockConnect();

  return server;
};

/** Gets a server
 * @param id {string} Id of the server to get
 * @returns Server details or error object
 */
export const getServer = async (id) => {
  const path = getPath(id);
  const properties = await readProperties(path);

  if (properties.error) {
    return properties;
  }

  const worlds = () => getAll(path, properties["level-name"]);
  const enable = () => manageService("enable");
  const disable = () => manageService("disable");
  const copyScripts = () => copyServerScripts(id, path);
  const start = () => manageState("start");
  const stop = () => manageState("stop");

  const manageService = (type) =>
    new Promise((resolve, reject) =>
      exec(`sudo ${join(path, "setup-service.sh")} ${type}`, { shell: "/bin/bash" }, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          reject(error);
          return;
        }

        console.log(`stderr: ${stderr}`);
        console.log(`stdout: ${stdout}`);
        resolve();
      })
    );

  const manageState = (type) =>
    new Promise((resolve, reject) => {
      exec(`${join(path, type + ".sh")}`, { shell: "/bin/bash" }, (error, stdout, stderr) => {
        console.log(`${type}ing ${id}...`);
        if (error) {
          console.log(`error: ${error.message}`);
          console.error(error);
        }

        if (stderr) {
          console.log(`stderr: ${stderr}`);
        }

        if (stdout) {
          console.log(`stdout: ${stdout}`);
        }

        resolve();
      });
    });

  const updateBedrockConnect = async (previousName) => {
    try {
      await stat(bedrockConnectRoot);
    } catch (err) {
      console.error(err);
      return;
    }

    const configPath = join(bedrockConnectRoot, "server", "serverlist.json");
    console.log(configPath);
    const bcConfig = await readConfigData(configPath);
    console.dir(bcConfig);
    let serverDetails = previousName && bcConfig.find((x) => x.name === previousName);
    if (!serverDetails) {
      serverDetails = {
        name: properties["server-name"],
      };
      bcConfig.push(serverDetails);
    }

    serverDetails.address = minecraftServerHost;
    serverDetails.port = parseInt(properties["server-port"], 10);
    console.dir(bcConfig);
    await writeFile(configPath, JSON.stringify(bcConfig, null, 2));
  };

  const update = async (params) => {
    const propertiesBackupPath = join(path, "server.properties_backups");
    const propertiesPath = join(path, "server.properties");
    const timestamp = new Date().toISOString().replaceAll("-", "_").replaceAll(":", "_");
    await mkdir(propertiesBackupPath, { recursive: true });
    await cp(propertiesPath, join(propertiesBackupPath, `server.properties.${timestamp}`));

    const serverProperties = config
      .flatMap((details) => {
        const getValue = () => {
          if (details.type === "boolean") {
            return params[details.key] ? "on" : "off";
          }

          return params[details.key];
        };

        return [`${details.key}=${getValue()}`, buildComment(details), ""];
      })
      .join("\n");

    writeFile(propertiesPath, serverProperties);

    await copyScripts();
    await enable();
    await updateBedrockConnect(properties["server-name"]);
  };

  return {
    id,
    properties,
    path,
    isServiceEnabled: isServiceEnabled(id),
    isRunning: isRunning(id),
    worlds,
    enable,
    disable,
    copyScripts,
    start,
    stop,
    update,
    updateBedrockConnect,
  };
};
