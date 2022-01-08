import path from "path";
import fs from "fs";
import { promisify } from "util";
import snakeCase from "../../utilities/snakeCase.mjs";
import buildServerPath from "../../utilities/buildServerPath.mjs";
import config from "./config.mjs";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

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

    const serverProperties = config
      .flatMap((details) => {
        console.log(details.key);

        const value = req.body[details.key] || details.defaultValue;

        return [`${details.key}=${value}`, buildComment(details), ""];
      })
      .join("\n");

    writeFile(path.join(serverPath, "server.properties"), serverProperties);

    const server = await getServer();

    await server.copyScripts();
    await server.enable();

    res.redirect("/servers");
  });
};
