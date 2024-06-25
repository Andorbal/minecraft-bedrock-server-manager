import { getServer } from "##/services/servers.mjs";
import propertiesList from "./config.mjs";

export default (app) => {
  app.get("/server/:server/properties", async (req, res) => {
    const serverId = req.params.server;

    const server = await getServer(serverId);

    for (const prop of propertiesList) {
      prop.value = server.properties[prop.key];
    }

    res.render("servers/properties", {
      serverName: server.properties["server-name"],
      server: serverId,
      properties: propertiesList,
    });
  });
};
