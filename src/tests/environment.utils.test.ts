import {
  describe,
  expect,
  it
} from "vitest";

import {
  parseEnvironmentVariables,
  extractEnvironmentVariables
} from "../utils/environment.utils.js";

describe(
  "environment.utils",
  () => {
    it(
      "should parse environment variables",
      () => {
        const content = `
API_URL=http://localhost:3000
DATABASE_URL=postgres://localhost
JWT_SECRET=secret-value
`;

        const result =
          parseEnvironmentVariables(
            content
          );

        expect(
          result.has("API_URL")
        ).toBe(true);

        expect(
          result.has("DATABASE_URL")
        ).toBe(true);

        expect(
          result.has("JWT_SECRET")
        ).toBe(true);
      }
    );

    it(
      "should ignore comments",
      () => {
        const content = `
# API_URL=http://localhost
API_URL=http://localhost:3000
`;

        const result =
          parseEnvironmentVariables(
            content
          );

        expect(
          result.has("API_URL")
        ).toBe(true);

        expect(
          result.size
        ).toBe(1);
      }
    );

    it(
      "should support export syntax",
      () => {
        const content = `
export API_URL=http://localhost:3000
export DATABASE_URL=postgres://localhost
`;

        const result =
          parseEnvironmentVariables(
            content
          );

        expect(
          result.has("API_URL")
        ).toBe(true);

        expect(
          result.has("DATABASE_URL")
        ).toBe(true);
      }
    );

    it(
      "should detect process.env variables",
      () => {
        const content = `
const apiUrl = process.env.API_URL;
const jwtSecret = process.env.JWT_SECRET;
`;

        const result =
          extractEnvironmentVariables(
            content
          );

        expect(
          result.has("API_URL")
        ).toBe(true);

        expect(
          result.has("JWT_SECRET")
        ).toBe(true);
      }
    );

    it(
      "should detect import.meta.env variables",
      () => {
        const content = `
const apiUrl = import.meta.env.VITE_API_URL;
const mode = import.meta.env.MODE;
`;

        const result =
          extractEnvironmentVariables(
            content
          );

        expect(
          result.has("VITE_API_URL")
        ).toBe(true);

        expect(
          result.has("MODE")
        ).toBe(true);
      }
    );

    it(
      "should detect multiple environment variables",
      () => {
        const content = `
const apiUrl = process.env.API_URL;
const databaseUrl = process.env.DATABASE_URL;
const viteUrl = import.meta.env.VITE_API_URL;
`;

        const result =
          extractEnvironmentVariables(
            content
          );

        expect(
          result.size
        ).toBe(3);
      }
    );
  }
);