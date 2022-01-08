import path from "path";
import { exec } from "child_process";
import { readdir, readFile, stat, rm, rmdir } from "##/utilities/promisedFs.mjs";
import buildServerPath from "##/utilities/buildServerPath.mjs";
import buildWorldPath from "##/utilities/buildWorldPath.mjs";
import readProperties from "##/utilities/readProperties.mjs";

import { v4 as uuidv4 } from "uuid";

export default async (app, minecraftServerRoot) => {
  app.post("/server/:server/world/:world/addons", async (req, res) => {
    const fileName = req.files.addon.name;
    if (!fileName.endsWith(".mcaddon") && !fileName.endsWith(".mcpack")) {
      res.send(500);
    }

    console.dir(req.files);

    const tempName = uuidv4();
    const zipFile = `/tmp/${tempName}.zip`;
    const extractedDir = `/tmp/${tempName}`;

    try {
      await req.files.addon.mv(zipFile);

      await new Promise((resolve, reject) => {
        exec(`unzip ${zipFile} -d ${extractedDir}`, { shell: "/bin/bash" }, (error, stdout, stderr) => {
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

      const manifest = (await readFile(path.join(extractedDir, "manifest.json"))).toString();
      console.dir(manifest);
    } finally {
      await rm(zipFile);
      await rmdir(extractedDir, { recursive: true, force: true });
    }

    res.send(201);
  });
};
