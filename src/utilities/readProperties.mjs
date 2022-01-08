import path from "path";
import { readFile } from "./promisedFs.mjs";

export default async (serverPath) => {
  const propertyData = await readFile(path.join(serverPath, "server.properties"));

  const propertyItems = propertyData
    .toString()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => line.split("=").map((item) => item.trim()));

  return Object.fromEntries(propertyItems);
};
