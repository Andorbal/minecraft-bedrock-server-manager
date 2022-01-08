module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  reporters: ["default"],
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(mjs?|js?)$",
  transform: {
    //"^.+\\.jsx?$": "babel-jest",
    "^.+\\.mjs$": "babel-jest",
  },
  //testPathIgnorePatterns: ["<rootDir>/build/", "<rootDir>/node_modules/"],
  moduleFileExtensions: ["js", "mjs"],
};
