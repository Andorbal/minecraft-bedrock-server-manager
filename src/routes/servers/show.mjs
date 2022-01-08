import path from "path";
import { readdir, readFile } from "##/utilities/promisedFs.mjs";
import { exec } from "child_process";
import buildServerPath from "##/utilities/buildServerPath.mjs";
import readProperties from "##/utilities/readProperties.mjs";

export default (app, minecraftServerRoot) => {
  app.get("/server/:server", async (req, res) => {
    const serverPath = buildServerPath(minecraftServerRoot, req.params.server);

    const properties = await readProperties(serverPath);

    const running = await new Promise((resolve, reject) => {
      exec(`screen -list | grep -q "\.${req.params.server}"`, { shell: "/bin/bash" }, (error, stdout, stderr) => {
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

    const worldList = await readdir(path.join(serverPath, "worlds"));
    const worlds = worldList.map((world) => ({ name: world, isDefault: world === properties["level-name"] }));

    const name = properties["server-name"];

    res.render("servers/show", { serverName: name, server: req.params.server, running, worlds });
  });
};
