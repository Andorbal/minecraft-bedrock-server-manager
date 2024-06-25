import create from "./create.mjs";
import disable from "./disable.mjs";
import enable from "./enable.mjs";
import list from "./list.mjs";
import newServer from "./new.mjs";
import properties from "./properties.mjs";
import show from "./show.mjs";
import start from "./start.mjs";
import stop from "./stop.mjs";
import update from "./update.mjs";
import updateScripts from "./updateScripts.mjs";

export default (app) => {
  [create, disable, enable, list, newServer, properties, show, start, stop, update, updateScripts].forEach((route) =>
    route(app)
  );
};
