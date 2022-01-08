import { exec } from "child_process";
import { join } from "path";
import { readdir, readFile, stat } from "##/utilities/promisedFs.mjs";
import { getAll } from "./worlds.mjs";
import { copyScripts } from "##/utilities/copyScripts.mjs";

const minecraftServerRoot = process.env.MINECRAFT_SERVER_ROOT;

if (!minecraftServerRoot) {
  throw new Error("MINECRAFT_SERVER_ROOT environment variable is not set");
}

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
    const command = `screen -list | grep -q "\.${id}"`;
    exec(command, { shell: "/bin/bash" }, (error, stdout, stderr) => {
      if (error) {
        console.dir(error);
        resolve(false);
        return;
      } else if (stderr) {
        console.log(`stderr: ${stderr}`);
      } else {
        console.log(`stdout: ${stdout}`);
      }

      resolve(true);
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
        } else if (stderr) {
          console.log(`stderr: ${stderr}`);
        } else {
          console.log(`stdout: ${stdout}`);
        }

        resolve();
      });
    });

  return {
    id,
    properties,
    path,
    isServiceEnabled: isServiceEnabled(id),
    isRunning: isRunning(id),
    worlds: () => getAll(path, properties["level-name"]),
    enable: () => manageService("enable"),
    disable: () => manageService("disable"),
    copyScripts: () => copyScripts(id, path),
    start: () => manageState("start"),
    stop: () => manageState("stop"),
  };
};
