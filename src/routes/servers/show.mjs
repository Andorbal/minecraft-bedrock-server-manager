import { getServer } from "##/services/servers.mjs";

export default (app) => {
  app.get("/server/:server", async (req, res) => {
    const id = req.params.server;
    const server = await getServer(id);

    const [worlds, running, enabled] = await Promise.all([
      server.worlds(),
      server.isRunning(),
      server.isServiceEnabled(),
    ]);

    res.render("servers/show", {
      serverName: server.properties["server-name"],
      server: id,
      running,
      enabled,
      worlds,
    });
  });
};
