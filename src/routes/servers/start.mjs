import { getServer } from "##/services/servers.mjs";

export default async (app) => {
  app.post("/server/:server/start", async (req, res) => {
    const id = req.params.server;
    const server = await getServer(id);

    await server.start();

    res.redirect(`/server/${id}`);
  });
};
