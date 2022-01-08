import show from "./show.mjs";
import addonUpload from "./addonUpload.mjs";

const routes = [addonUpload, show];

const minecraftServerRoot = process.env.MINECRAFT_SERVER_ROOT;

if (!minecraftServerRoot) {
  throw new Error("MINECRAFT_SERVER_ROOT environment variable is not set");
}

export default (app) => {
  routes.forEach((route) => route(app, minecraftServerRoot));
};
