import fs from "fs";
import { promisify } from "util";

export const chmod = promisify(fs.chmod);
export const rm = promisify(fs.rm);
export const rmdir = promisify(fs.rmdir);
export const stat = promisify(fs.stat);
export const readFile = promisify(fs.readFile);
export const readdir = promisify(fs.readdir);
export const writeFile = promisify(fs.writeFile);
