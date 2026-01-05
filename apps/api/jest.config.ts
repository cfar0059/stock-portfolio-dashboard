import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: __dirname,
  testMatch: ["**/*.spec.ts", "**/test/**/*.e2e.spec.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
      },
    ],
  },
  // Increase timeout for e2e tests that need DB connection
  testTimeout: 30000,
};

export default config;
