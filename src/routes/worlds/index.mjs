import show from "./show.mjs";
import addonUpload from "./addonUpload.mjs";

const routes = [addonUpload, show];

export default (app) => {
  routes.forEach((route) => route(app));
};
