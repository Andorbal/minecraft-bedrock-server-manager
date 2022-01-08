import create from "./create.mjs";
import enable from "./enable.mjs";
import disable from "./disable.mjs";
import list from "./list.mjs";
import newServer from "./new.mjs";
import show from "./show.mjs";
import start from "./start.mjs";
import stop from "./stop.mjs";
import updateScripts from "./updateScripts.mjs";

export default (app) => {
  [create, enable, disable, list, newServer, show, start, stop, updateScripts].forEach((route) => route(app));
};
