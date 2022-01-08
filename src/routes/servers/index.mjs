import create from "./create.mjs";
import list from "./list.mjs";
import newServer from "./new.mjs";
import show from "./show.mjs";
import start from "./start.mjs";
import stop from "./stop.mjs";

const routes = [create, list, newServer, show, start, stop];

const minecraftServerRoot = process.env.MINECRAFT_SERVER_ROOT;

if (!minecraftServerRoot) {
  throw new Error("MINECRAFT_SERVER_ROOT environment variable is not set");
}

export default (app) => {
  routes.forEach((route) => route(app, minecraftServerRoot));
};
