import path from "path";
import fs from "fs";
import { promisify } from "util";
import snakeCase from "../../utilities/snakeCase.mjs";
import buildServerPath from "../../utilities/buildServerPath.mjs";
import { createServer } from "##/services/servers.mjs";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

export default async (app) => {
  app.post("/servers/create", async (req, res) => {
    console.dir(req.body);

    await createServer(req.body);

    res.redirect("/servers");
  });
};
