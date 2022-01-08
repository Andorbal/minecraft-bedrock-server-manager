import { readFile } from "./promisedFs.mjs";
import readProperties from "./readProperties.mjs";

jest.mock("./promisedFs.mjs");

beforeEach(() => {
  readFile.mockResolvedValue("");
});

it("should read server.properties file", async () => {
  await readProperties("/foo/bar");

  expect(readFile).toHaveBeenCalledWith("/foo/bar/server.properties");
});

it("should return items", async () => {
  readFile.mockResolvedValueOnce(`
flow=bots
  `);

  const results = await readProperties("/");

  expect(results).toStrictEqual({ flow: "bots" });
});

it("should return multiple items", async () => {
  readFile.mockResolvedValueOnce(`
flow=bots
cheese=graters
  `);

  const results = await readProperties("/");

  expect(results).toStrictEqual({ flow: "bots", cheese: "graters" });
});

it("should ignore comments", async () => {
  readFile.mockResolvedValueOnce(`
  # this should=be ignored
flow=bots
# how about this?
  `);

  const results = await readProperties("/");

  expect(results).toStrictEqual({ flow: "bots" });
});
