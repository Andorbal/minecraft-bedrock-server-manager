import { getServer } from "##/services/servers.mjs";

export default async (app) => {
  app.post("/server/:server/properties", async (req, res) => {
    const serverId = req.params.server;

    const server = await getServer(serverId);
    await server.update(req.body);

    res.redirect(`/server/${serverId}`);
  });
};
