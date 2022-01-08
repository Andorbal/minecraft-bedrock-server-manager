import { join } from "path";

export default (serverPath, world) => {
  const worldBasePath = join(serverPath, "worlds");
  const worldPath = join(worldBasePath, world);

  if (!worldPath.startsWith(worldBasePath)) {
    throw new Error("Resolved path does not start with base path");
  }

  return worldPath;
};
