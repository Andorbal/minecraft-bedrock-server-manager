module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  reporters: ["default"],
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};
