import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import {
  loadLumenConfig
} from "../services/config.service.js";

const temporaryDirectories: string[] = [];

function createTempProject(): string {
  const directory =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        "lumen-config-"
      )
    );

  temporaryDirectories.push(
    directory
  );

  return directory;
}

afterEach(() => {
  for (
    const directory of
    temporaryDirectories
  ) {
    fs.rmSync(
      directory,
      {
        recursive: true,
        force: true
      }
    );
  }

  temporaryDirectories.length = 0;
});

describe(
  "config.service",
  () => {
    it(
      "should return default config",
      async () => {
        const project =
          createTempProject();

        const config =
          await loadLumenConfig(
            project
          );

        expect(
          config.ignore
        ).toEqual([]);

        expect(
          config.failOn
        ).toBe("error");

        expect(
          config.dependency
            ?.checkUpdates
        ).toBe(true);

        expect(
          config.security
            ?.enabled
        ).toBe(true);

        expect(
          config.environment
            ?.enabled
        ).toBe(true);
      }
    );

    it(
      "should load lumen.config.mjs",
      async () => {
        const project =
          createTempProject();

        fs.writeFileSync(
          path.join(
            project,
            "lumen.config.mjs"
          ),
          `
          export default {
            ignore: [
              "fixtures/",
              "generated/"
            ],

            failOn: "warning",

            dependency: {
              checkUpdates: false
            },

            security: {
              enabled: false
            },

            environment: {
              enabled: false
            }
          };
          `
        );

        const config =
          await loadLumenConfig(
            project
          );

        expect(
          config.ignore
        ).toEqual([
          "fixtures/",
          "generated/"
        ]);

        expect(
          config.failOn
        ).toBe("warning");

        expect(
          config.dependency
            ?.checkUpdates
        ).toBe(false);

        expect(
          config.security
            ?.enabled
        ).toBe(false);

        expect(
          config.environment
            ?.enabled
        ).toBe(false);
      }
    );

    it(
      "should normalize invalid ignore values",
      async () => {
        const project =
          createTempProject();

        fs.writeFileSync(
          path.join(
            project,
            "lumen.config.mjs"
          ),
          `
          export default {
            ignore: [
              "src/tests/",
              123,
              null,
              "fixtures/"
            ]
          };
          `
        );

        const config =
          await loadLumenConfig(
            project
          );

        expect(
          config.ignore
        ).toEqual([
          "src/tests/",
          "fixtures/"
        ]);
      }
    );

    it(
      "should normalize invalid failOn",
      async () => {
        const project =
          createTempProject();

        fs.writeFileSync(
          path.join(
            project,
            "lumen.config.mjs"
          ),
          `
          export default {
            failOn: "invalid"
          };
          `
        );

        const config =
          await loadLumenConfig(
            project
          );

        expect(
          config.failOn
        ).toBe("error");
      }
    );

    it(
      "should support failOn none",
      async () => {
        const project =
          createTempProject();

        fs.writeFileSync(
          path.join(
            project,
            "lumen.config.mjs"
          ),
          `
          export default {
            failOn: "none"
          };
          `
        );

        const config =
          await loadLumenConfig(
            project
          );

        expect(
          config.failOn
        ).toBe("none");
      }
    );
  }
);