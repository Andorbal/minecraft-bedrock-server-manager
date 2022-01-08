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

export default async (app, minecraftServerRoot) => {
  app.post("/server/:server/stop", async (req, res) => {
    const serverPath = buildServerPath(minecraftServerRoot, req.params.server);

    await new Promise((resolve, reject) => {
      exec(`${path.join(serverPath, "stop.sh")}`, { shell: "/bin/bash" }, (error, stdout, stderr) => {
        console.log(`Stopping ${req.params.server}...`);
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

    console.log(`Done stopping ${req.params.server}.`);

    res.redirect(`/server/${req.params.server}`);
  });
};
