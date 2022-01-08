import path from "path";
import fs from "fs";
import { userInfo } from "os";
import { promisify } from "util";
import snakeCase from "../../utilities/snakeCase.mjs";
import buildServerPath from "../../utilities/buildServerPath.mjs";
import config from "./config.mjs";
import { exec } from "child_process";

const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const chmod = promisify(fs.chmod);

const scriptBasePath = path.resolve("./scripts/templates");
const scripts = ["fixpermissions.sh", "minecraftbe.service", "restart.sh", "start.sh", "stop.sh", "setup-service.sh"];
const serverPathRegex = new RegExp(/dirname\/minecraftbe\/servername/g);
const servernameRegex = new RegExp(/servername/g);
const usernameRegex = new RegExp(/userxname/g);
const userPathRegex = new RegExp(/pathvariable/g);

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

export default async (app, minecraftServerRoot) => {
  app.post("/servers/create", async (req, res) => {
    console.dir(req.body);

    const nameSnakeCase = snakeCase(req.body["server-name"]);
    const serverPath = buildServerPath(minecraftServerRoot, nameSnakeCase);

    if (fs.existsSync(serverPath)) {
      throw new Error("Server already exists");
    }

    console.log(serverPath);

    await mkdir(serverPath, { recursive: true });

    const username = userInfo().username;

    for (const script of scripts) {
      const inputPath = path.join(scriptBasePath, script);
      const outputPath = path.join(serverPath, script);

      console.log(inputPath);
      const scriptContents = (await readFile(inputPath)).toString();

      const modifiedScript = scriptContents
        .replace(serverPathRegex, serverPath)
        .replace(servernameRegex, nameSnakeCase)
        .replace(usernameRegex, username)
        .replace(userPathRegex, process.env.PATH);

      await writeFile(outputPath, modifiedScript);

      if (outputPath.endsWith(".sh")) {
        await chmod(outputPath, "755");
      }
    }

    const serverProperties = config
      .flatMap((details) => {
        console.log(details.key);

        const value = req.body[details.key] || details.defaultValue;

        return [`${details.key}=${value}`, buildComment(details), ""];
      })
      .join("\n");

    writeFile(path.join(serverPath, "server.properties"), serverProperties);

    exec(`sudo ${path.join(serverPath, "setup-service.sh")}`, { shell: "/bin/bash" }, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });

    res.redirect("/servers");
  });
};
