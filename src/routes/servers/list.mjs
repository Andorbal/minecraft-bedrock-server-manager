import path from "path";
import fs from "fs";
import { promisify } from "util";

const readdir = promisify(fs.readdir);

export default (app, minecraftServerRoot) => {
  app.get("/servers", async (req, res) => {
    const servers = await readdir(minecraftServerRoot);

    console.dir(servers, { depth: null });

    res.render("servers", {
      servers,
    });
  });
};
