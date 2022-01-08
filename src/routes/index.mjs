import servers from "./servers/index.mjs";
import worlds from "./worlds/index.mjs";

export default (app) => {
  servers(app);
  worlds(app);
};
