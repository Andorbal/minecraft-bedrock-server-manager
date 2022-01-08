import { join } from "path";
import { readdir, stat } from "##/utilities/promisedFs.mjs";

export const getAll = async (serverPath, defaultWorld) => {
  const worldPath = join(serverPath, "worlds");

  try {
    await stat(worldPath);
    const worldList = await readdir(worldPath);
    return worldList.map((world) => ({ name: world, isDefault: world === defaultWorld }));
  } catch (err) {
    console.dir(err);
    return [];
  }
};
