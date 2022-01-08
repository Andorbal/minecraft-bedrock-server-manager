import { listServers } from "##/services/servers.mjs";

export default (app) => {
  app.get("/servers", async (req, res) => {
    const servers = await listServers();

    res.render("servers", {
      servers,
    });
  });
};
