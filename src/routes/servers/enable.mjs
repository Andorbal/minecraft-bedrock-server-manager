import { getServer } from "##/services/servers.mjs";

export default async (app) => {
  app.post("/server/:server/enable", async (req, res) => {
    const id = req.params.server;
    const server = await getServer(id);

    await server.enable();

    console.log(`Done enabling ${id}.`);

    res.redirect(`/server/${id}`);
  });
};
