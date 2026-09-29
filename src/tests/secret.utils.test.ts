import {
  describe,
  expect,
  it
} from "vitest";

import {
  findSecretPatterns
} from "../utils/secret.utils.js";

describe(
  "secret.utils",
  () => {
    it(
      "should detect API key",
      () => {
        const content =
          `const apiKey = "this-is-a-fake-api-key-123456";`;

        const result =
          findSecretPatterns(
            content
          );

        expect(
          result.some(
            (secret) =>
              secret.type === "api-key"
          )
        ).toBe(true);
      }
    );

    it(
      "should detect camelCase API key",
      () => {
        const content =
          `const anotherApiKey = "another-fake-api-key-123456";`;

        const result =
          findSecretPatterns(
            content
          );

        expect(
          result.some(
            (secret) =>
              secret.type === "api-key"
          )
        ).toBe(true);
      }
    );

    it(
      "should detect JWT",
      () => {
        const content =
          `const token = "eyJ1234567890.abcdefghijklm.zyxwvutsrqpon";`;

        const result =
          findSecretPatterns(
            content
          );

        expect(
          result.some(
            (secret) =>
              secret.type === "jwt"
          )
        ).toBe(true);
      }
    );

    it(
      "should detect private key",
      () => {
        const content =
          `-----BEGIN PRIVATE KEY-----
fake-private-key
-----END PRIVATE KEY-----`;

        const result =
          findSecretPatterns(
            content
          );

        expect(
          result.some(
            (secret) =>
              secret.type ===
              "private-key"
          )
        ).toBe(true);
      }
    );

    it(
      "should not detect normal code",
      () => {
        const content =
          `
          const name = "Yusuf";
          const age = 25;
          console.log(name, age);
          `;

        const result =
          findSecretPatterns(
            content
          );

        expect(
          result
        ).toHaveLength(0);
      }
    );
  }
);