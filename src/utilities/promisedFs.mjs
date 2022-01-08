import fs from "fs";
import { promisify } from "util";

export const rm = promisify(fs.rm);
export const rmdir = promisify(fs.rmdir);
export const stat = promisify(fs.stat);
export const readFile = promisify(fs.readFile);
export const readdir = promisify(fs.readdir);
