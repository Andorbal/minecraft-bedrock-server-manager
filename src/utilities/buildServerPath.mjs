import { join } from "path";

export default (base, server) => {
  const serverPath = join(base, server);

  if (!serverPath.startsWith(base)) {
    throw new Error("Resolved path does not start with base path");
  }

  return serverPath;
};
