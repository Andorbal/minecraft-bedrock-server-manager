import { createServer } from "##/services/servers.mjs";

export default async (app) => {
  app.post("/servers/create", async (req, res) => {
    console.dir(req.body);

    await createServer(req.body);

    res.redirect("/servers");
  });
};
