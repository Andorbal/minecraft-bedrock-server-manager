import { getServer } from "##/services/servers.mjs";
import { getWorld } from "##/services/worlds.mjs";

export default (app) => {
  app.get("/server/:server/world/:world", async (req, res) => {
    const serverId = req.params.server;
    const worldId = req.params.world;

    const server = await getServer(serverId);
    const world = await getWorld(server, worldId);

    const name = server.properties["server-name"];

    const [resourcePacks, behaviorPacks] = await Promise.all([world.resourcePacks(), world.behaviorPacks()]);

    res.render("worlds/show", {
      serverName: name,
      server: req.params.server,
      world: worldId,
      behaviorPacks,
      resourcePacks,
    });
  });
};
