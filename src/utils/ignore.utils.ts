import fs from "node:fs";
import path from "node:path";

const DEFAULT_IGNORED_DIRECTORIES =
  new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    ".expo",
    "coverage",
    ".cache"
  ]);

const DEFAULT_IGNORED_FILES =
  new Set([
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock"
  ]);

function normalizePath(
  value: string
): string {
  return value
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/^\/+/, "");
}

export function loadLumenIgnore(
  projectPath: string
): string[] {
  const ignorePath = path.join(
    projectPath,
    ".lumenignore"
  );

  if (!fs.existsSync(ignorePath)) {
    return [];
  }

  try {
    return fs
      .readFileSync(
        ignorePath,
        "utf-8"
      )
      .split(/\r?\n/)
      .map((line) =>
        line.trim()
      )
      .filter(
        (line) =>
          line.length > 0 &&
          !line.startsWith("#")
      );
  } catch {
    return [];
  }
}

function globToRegExp(
  pattern: string
): RegExp {
  let regex = "";
  let index = 0;

  while (index < pattern.length) {
    const char =
      pattern[index];

    if (char === "*") {
      if (
        pattern[index + 1] === "*"
      ) {
        regex += ".*";
        index += 2;
        continue;
      }

      regex += "[^/]*";
      index++;
      continue;
    }

    if (char === "?") {
      regex += "[^/]";
      index++;
      continue;
    }

    regex += char.replace(
      /[.+^${}()|[\]\\]/g,
      "\\$&"
    );

    index++;
  }

  return new RegExp(
    `^${regex}$`
  );
}

function matchesPattern(
  relativePath: string,
  pattern: string
): boolean {
  const normalizedPath =
    normalizePath(
      relativePath
    );

  let normalizedPattern =
    normalizePath(
      pattern
    );

  const isDirectoryPattern =
    normalizedPattern.endsWith("/");

  if (isDirectoryPattern) {
    normalizedPattern =
      normalizedPattern.replace(
        /\/+$/,
        ""
      );
  }

  /*
   * Directory pattern.
   *
   * Example:
   *
   * src/tests/
   *
   * matches:
   *
   * src/tests
   * src/tests/example.ts
   */
  if (isDirectoryPattern) {
    return (
      normalizedPath ===
        normalizedPattern ||
      normalizedPath.startsWith(
        `${normalizedPattern}/`
      )
    );
  }

  /*
   * If the pattern does not contain
   * a slash, treat it as a name that
   * can appear at any level.
   *
   * Example:
   *
   * fixtures
   *
   * matches:
   *
   * fixtures
   * src/fixtures
   * test/fixtures
   */
  if (
    !normalizedPattern.includes("/")
  ) {
    const parts =
      normalizedPath.split("/");

    return parts.some(
      (part) =>
        globToRegExp(
          normalizedPattern
        ).test(part)
    );
  }

  /*
   * Path pattern.
   *
   * Example:
   *
   * src/tests/*.ts
   */
  return globToRegExp(
    normalizedPattern
  ).test(
    normalizedPath
  );
}

export function shouldIgnorePath(
  projectPath: string,
  filePath: string,
  ignorePatterns: string[] = []
): boolean {
  const relativePath =
    normalizePath(
      path.relative(
        projectPath,
        filePath
      )
    );

  if (
    relativePath === "" ||
    relativePath.startsWith("../")
  ) {
    return true;
  }

  const parts =
    relativePath.split("/");

  /*
   * Default ignored directories.
   */

  if (
    parts.some((part) =>
      DEFAULT_IGNORED_DIRECTORIES.has(
        part
      )
    )
  ) {
    return true;
  }

  /*
   * Default ignored files.
   */

  const fileName =
    path.basename(
      relativePath
    );

  if (
    DEFAULT_IGNORED_FILES.has(
      fileName
    )
  ) {
    return true;
  }

  /*
   * User-defined .lumenignore.
   */

  return ignorePatterns.some(
    (pattern) =>
      matchesPattern(
        relativePath,
        pattern
      )
  );
}