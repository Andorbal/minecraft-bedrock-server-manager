import { join, resolve } from "path";
import { chmod, readFile, writeFile } from "##/utilities/promisedFs.mjs";
import { userInfo } from "os";

const scriptBasePath = resolve("./scripts/templates");
const scripts = ["fixpermissions.sh", "minecraftbe.service", "restart.sh", "start.sh", "stop.sh", "setup-service.sh"];
const serverPathRegex = new RegExp(/dirname\/minecraftbe\/servername/g);
const servernameRegex = new RegExp(/servername/g);
const usernameRegex = new RegExp(/userxname/g);
const userPathRegex = new RegExp(/pathvariable/g);

export const copyScripts = async (id, serverPath) => {
  const username = userInfo().username;

  for (const script of scripts) {
    const inputPath = join(scriptBasePath, script);
    const outputPath = join(serverPath, script);

    console.log(inputPath);
    const scriptContents = (await readFile(inputPath)).toString();

    const modifiedScript = scriptContents
      .replace(serverPathRegex, serverPath)
      .replace(servernameRegex, id)
      .replace(usernameRegex, username)
      .replace(userPathRegex, process.env.PATH);

    await writeFile(outputPath, modifiedScript);

    if (outputPath.endsWith(".sh")) {
      await chmod(outputPath, "755");
    }
  }
};
