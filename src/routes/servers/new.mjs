import properties from "./config.mjs";

export default (app) => {
  app.get("/servers/new", async (req, res) => {
    res.render("servers/new", { properties });
  });
};
