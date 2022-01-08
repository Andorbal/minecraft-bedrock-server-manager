import { getServer } from "##/services/servers.mjs";

export default async (app) => {
  app.post("/server/:server/stop", async (req, res) => {
    const id = req.params.server;
    const server = await getServer(id);

    await server.stop();

    res.redirect(`/server/${id}`);
  });
};
