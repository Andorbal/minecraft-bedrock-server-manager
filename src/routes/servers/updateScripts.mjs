import { getServer } from "##/services/servers.mjs";

export default async (app) => {
  app.post("/server/:server/updateScripts", async (req, res) => {
    const id = req.params.server;
    const server = await getServer(id);

    await server.copyScripts();

    console.log(`Done copying scripts for ${id}.`);

    res.redirect(`/server/${id}`);
  });
};
