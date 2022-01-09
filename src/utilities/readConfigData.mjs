import { readFile } from "fs/promises";

export const readConfigData = async (filePath) => {
  try {
    const fileData = await readFile(filePath);
    return JSON.parse(fileData.toString());
  } catch (err) {
    console.error(err);
    return [];
  }
};
