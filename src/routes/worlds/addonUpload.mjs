import { join } from "path";
import { exec } from "child_process";
import { readdir, readFile, stat, rm, rmdir } from "##/utilities/promisedFs.mjs";
import buildServerPath from "##/utilities/buildServerPath.mjs";
import buildWorldPath from "##/utilities/buildWorldPath.mjs";
import readProperties from "##/utilities/readProperties.mjs";

import { v4 as uuidv4 } from "uuid";
import { getServer } from "##/services/servers.mjs";
import { cp } from "fs/promises";
import { getWorld } from "##/services/worlds.mjs";

export default async (app) => {
  app.post("/server/:server/world/:world/addons", async (req, res) => {
    const serverId = req.params.server;
    const worldId = req.params.world;
    const server = await getServer(serverId);
    const world = await getWorld(server, worldId);

    const fileName = req.files.addon.name;
    if (!fileName.endsWith(".mcaddon") && !fileName.endsWith(".mcpack")) {
      res.send(500);
    }

    const tempName = uuidv4();
    const zipFile = `/tmp/${tempName}.zip`;
    const extractedDir = `/tmp/${tempName}`;

    try {
      await req.files.addon.mv(zipFile);

      await new Promise((resolve, reject) => {
        exec(`unzip -q ${zipFile} -d ${extractedDir}`, { shell: "/bin/bash" }, (error, stdout, stderr) => {
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

      const stuff = await readdir(extractedDir);
      console.dir(stuff);

      const packs = stuff.includes("manifest.json") ? [extractedDir] : stuff.map((x) => join(extractedDir, x));

      for (const pack of packs) {
        try {
          await world.addPack(pack);
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
      res.send(500);
      return;
    } finally {
      await rm(zipFile);
      await rm(extractedDir, { recursive: true, force: true });
    }

    res.redirect(`/server/${serverId}/world/${worldId}`);
  });
};
