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
  loadLumenIgnore,
  shouldIgnorePath
} from "../utils/ignore.utils.js";

const temporaryDirectories: string[] = [];

function createTempProject(
  content: string
): string {
  const directory =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        "lumen-ignore-"
      )
    );

  fs.writeFileSync(
    path.join(
      directory,
      ".lumenignore"
    ),
    content
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
  "ignore.utils",
  () => {
    it(
      "should load .lumenignore",
      () => {
        const project =
          createTempProject(`
src/tests/
fixtures/
`);

        const result =
          loadLumenIgnore(
            project
          );

        expect(
          result
        ).toEqual([
          "src/tests/",
          "fixtures/"
        ]);
      }
    );

    it(
      "should ignore a directory from .lumenignore",
      () => {
        const project =
          createTempProject(
            "src/tests/"
          );

        const filePath =
          path.join(
            project,
            "src",
            "tests",
            "example.ts"
          );

        expect(
          shouldIgnorePath(
            project,
            filePath,
            loadLumenIgnore(
              project
            )
          )
        ).toBe(true);
      }
    );

    it(
      "should not ignore a normal source file",
      () => {
        const project =
          createTempProject(
            "src/tests/"
          );

        const filePath =
          path.join(
            project,
            "src",
            "config.ts"
          );

        expect(
          shouldIgnorePath(
            project,
            filePath,
            loadLumenIgnore(
              project
            )
          )
        ).toBe(false);
      }
    );

    it(
      "should ignore default directories",
      () => {
        const project =
          createTempProject("");

        const filePath =
          path.join(
            project,
            "node_modules",
            "package",
            "index.js"
          );

        expect(
          shouldIgnorePath(
            project,
            filePath
          )
        ).toBe(true);
      }
    );

    it(
      "should ignore default lock files",
      () => {
        const project =
          createTempProject("");

        const filePath =
          path.join(
            project,
            "pnpm-lock.yaml"
          );

        expect(
          shouldIgnorePath(
            project,
            filePath
          )
        ).toBe(true);
      }
    );

    it(
      "should support wildcard patterns",
      () => {
        const project =
          createTempProject(
            "src/**/*.test.ts"
          );

        const filePath =
          path.join(
            project,
            "src",
            "utils",
            "example.test.ts"
          );

        expect(
          shouldIgnorePath(
            project,
            filePath,
            loadLumenIgnore(
              project
            )
          )
        ).toBe(true);
      }
    );
  }
);