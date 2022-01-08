import { getServer } from "##/services/servers.mjs";

export default async (app) => {
  app.post("/server/:server/disable", async (req, res) => {
    const id = req.params.server;
    const server = await getServer(id);

    await server.disable();

    console.log(`Done disabling ${id}.`);

    res.redirect(`/server/${id}`);
  });
};
