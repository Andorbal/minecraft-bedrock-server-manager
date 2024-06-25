import { join } from "path";
import { cp, readdir, readFile, stat, writeFile } from "fs/promises";
import { readConfigData } from "##/utilities/readConfigData.mjs";

const buildWorldPath = (serverPath, world) => {
  const worldBasePath = join(serverPath, "worlds");
  const worldPath = join(worldBasePath, world);

  if (!worldPath.startsWith(worldBasePath)) {
    throw new Error("Resolved path does not start with base path");
  }

  return worldPath;
};

const getTypeOfModule = (module) => {
  if (module.type === "resources") {
    return "resource";
  } else if (module.type === "data") {
    return "behavior";
  }

  throw new Error(`Unknown module type ${module.type}`);
};

const loadManifest = async (pack) => {
  const manifestPath = join(pack, "manifest.json");
  console.log(`========== READING ${manifestPath}`);
  return JSON.parse((await readFile(manifestPath)).toString());
};

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

const loadModules = async (path) => {
  try {
    const manifest = await loadManifest(path);
    return [
      {
        id: manifest.header.uuid,
        name: manifest.header.name,
        description: manifest.header.description,
      },
    ];
  } catch (err) {
    if (err.code === "ENOENT") {
      try {
        const submodulePaths = await readdir(path);

        const submodules = [];
        for (const submodulePath of submodulePaths) {
          submodules.push(await loadModules(join(path, submodulePath)));
        }

        return submodules.flat();
      } catch (err) {
        return [];
      }
    } else {
      throw err;
    }
  }
};

export const getWorld = async (server, world) => {
  const path = buildWorldPath(server.path, world);

  const readPackConfig = async (type) => {
    const filePath = join(path, `world_${type}_packs.json`);
    return await readConfigData(filePath);
  };

  const writePacksConfig = async (type, contents) => {
    const filePath = join(path, `world_${type}_packs.json`);
    try {
      await writeFile(filePath, JSON.stringify(contents, null, 2));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const enrichWithName = async (type) => {
    const typePath = join(path, `${type}_packs`);
    //const moduleNames = await readdir(typePath);

    const modules = (await loadModules(typePath)).flat();
    //  [];
    // for (const moduleName of moduleNames) {
    //   const manifest = await loadManifest(join(typePath, moduleName));
    //   modules.push({
    //     id: manifest.modules[0].uuid,
    //     name: manifest.header.name,
    //     description: manifest.header.description,
    //   });
    // }
    console.dir(modules);
    return (pack) => {
      try {
        console.dir(pack);
        //const packPath = join(path, `${type}_packs`, pack.pack_id);
        //const manifest = await loadManifest(packPath);

        const moduleDetails = modules.find((x) => x.id === pack.pack_id);

        return { ...pack, ...moduleDetails };
      } catch (err) {
        return { ...pack, name: pack.pack_id, error: "Unable to find pack" };
      }
    };
  };

  const addPack = async (pack) => {
    const manifest = await loadManifest(pack);
    console.dir(manifest);

    const module = manifest.modules[0];
    console.dir(module);
    const type = getTypeOfModule(module);

    const config = await readPackConfig(type);

    await cp(pack, join(path, `${type}_packs`, manifest.header.uuid), {
      recursive: true,
    });

    if (!config.find((x) => x.pack_id === manifest.header.uuid)) {
      config.push({ pack_id: manifest.header.uuid, version: manifest.header.version });
      await writePacksConfig(type, config);
    }
  };

  const listPacks = async (type) => {
    const enricher = await enrichWithName(type);
    const packs = await readPackConfig(type);

    return packs.map(enricher);
    // const enrichedPacks = [];
    // for (const pack of packs) {
    //   const enrichedPack = await enricher(pack);
    //   enrichedPacks.push(enrichedPack);
    // }

    // return enrichedPacks;
  };

  return {
    id: world,
    path,
    resourcePacks: () => listPacks("resource"),
    behaviorPacks: () => listPacks("behavior"),
    addPack,
  };
};
