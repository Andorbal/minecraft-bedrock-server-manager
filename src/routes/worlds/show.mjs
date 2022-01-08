import path from "path";
import { readdir, readFile, stat } from "##/utilities/promisedFs.mjs";
import buildServerPath from "##/utilities/buildServerPath.mjs";
import buildWorldPath from "##/utilities/buildWorldPath.mjs";
import readProperties from "##/utilities/readProperties.mjs";

const readConfig = async (worldPath, type) => {
  const filePath = path.join(worldPath, type + ".json");
  try {
    const results = await stat(filePath);
    console.dir(results);

    const fileData = await readFile(filePath);
    return fileData.toString();
  } catch (err) {
    return [];
  }
};

export default (app, minecraftServerRoot) => {
  app.get("/server/:server/world/:world", async (req, res) => {
    const serverPath = buildServerPath(minecraftServerRoot, req.params.server);
    const worldPath = buildWorldPath(serverPath, req.params.world);

    const properties = await readProperties(serverPath);
    const name = properties["server-name"];

    const worldList = await readdir(path.join(worldPath, "."));
    //const worlds = worldList.map((world) => ({ name: world, isDefault: world === properties["level-name"] }));
    console.log(worldList);

    const resourcePacks = await readConfig(worldPath, "world_resource_packs");
    const behaviorPacks = await readConfig(worldPath, "world_behavior_packs");

    res.render("worlds/show", {
      serverName: name,
      server: req.params.server,
      world: req.params.world,
      behaviorPacks,
      resourcePacks,
    });
  });
};
