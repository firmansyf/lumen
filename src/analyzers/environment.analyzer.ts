import fs from "node:fs";
import path from "node:path";

import type { Issue } from "../types/issue.js";

import {
  extractEnvironmentVariables,
  readEnvironmentFile
} from "../utils/environment.utils.js";

const IGNORED_DIRECTORIES =
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

const IGNORED_FILES =
  new Set([
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock"
  ]);

const SOURCE_EXTENSIONS =
  new Set([
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".mjs",
    ".cjs",
    ".mts",
    ".cts"
  ]);

const ENV_FILES = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test"
];

function shouldIgnore(
  filePath: string
): boolean {
  const parts =
    filePath.split(path.sep);

  if (
    parts.some((part) =>
      IGNORED_DIRECTORIES.has(part)
    )
  ) {
    return true;
  }

  return IGNORED_FILES.has(
    path.basename(filePath)
  );
}

function getSourceFiles(
  directory: string
): string[] {
  const files: string[] = [];

  if (shouldIgnore(directory)) {
    return files;
  }

  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(
      directory,
      {
        withFileTypes: true
      }
    );
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath =
      path.join(
        directory,
        entry.name
      );

    if (shouldIgnore(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(
        ...getSourceFiles(
          fullPath
        )
      );

      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension =
      path.extname(entry.name);

    if (
      SOURCE_EXTENSIONS.has(
        extension
      )
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function getLineNumber(
  content: string,
  index: number
): number {
  return (
    content
      .slice(0, index)
      .split("\n")
      .length
  );
}

function getReferencedVariables(
  projectPath: string
): Map<string, {
  file: string;
  line: number;
}> {
  const references =
    new Map<
      string,
      {
        file: string;
        line: number;
      }
    >();

  const files =
    getSourceFiles(
      projectPath
    );

  for (const filePath of files) {
    let content: string;

    try {
      const stats =
        fs.statSync(filePath);

      // Skip files larger than 1 MB.
      if (
        stats.size >
        1024 * 1024
      ) {
        continue;
      }

      content =
        fs.readFileSync(
          filePath,
          "utf-8"
        );
    } catch {
      continue;
    }

    const variables =
      extractEnvironmentVariables(
        content
      );

    for (const variable of variables) {
      if (
        references.has(variable)
      ) {
        continue;
      }

      const processRegex =
        new RegExp(
          `\\bprocess\\.env\\.${variable}\\b`
        );

      const importMetaRegex =
        new RegExp(
          `\\bimport\\.meta\\.env\\.${variable}\\b`
        );

      const processMatch =
        processRegex.exec(content);

      const importMetaMatch =
        importMetaRegex.exec(content);

      const match =
        processMatch ??
        importMetaMatch;

      if (!match) {
        continue;
      }

      const relativePath =
        path.relative(
          projectPath,
          filePath
        );

      references.set(
        variable,
        {
          file: relativePath,
          line: getLineNumber(
            content,
            match.index
          )
        }
      );
    }
  }

  return references;
}

function isGitignored(
  projectPath: string,
  target: string
): boolean {
  const gitignorePath =
    path.join(
      projectPath,
      ".gitignore"
    );

  if (
    !fs.existsSync(
      gitignorePath
    )
  ) {
    return false;
  }

  let content: string;

  try {
    content =
      fs.readFileSync(
        gitignorePath,
        "utf-8"
      );
  } catch {
    return false;
  }

  const lines =
    content.split("\n");

  const normalizedTarget =
    target.replace(
      /^\//,
      ""
    );

  for (const line of lines) {
    const trimmed =
      line.trim();

    if (
      !trimmed ||
      trimmed.startsWith("#")
    ) {
      continue;
    }

    const normalized =
      trimmed
        .replace(
          /^\//,
          ""
        )
        .replace(
          /\/$/,
          ""
        );

    if (
      normalized === normalizedTarget
    ) {
      return true;
    }

    /*
     * Support common patterns:
     *
     * .env*
     * *.env
     */
    if (
      normalized === ".env*" &&
      normalizedTarget.startsWith(
        ".env"
      )
    ) {
      return true;
    }

    if (
      normalized === "*.env" &&
      normalizedTarget.endsWith(
        ".env"
      )
    ) {
      return true;
    }
  }

  return false;
}

export function analyzeEnvironment(
  projectPath: string
): Issue[] {
  const issues: Issue[] = [];

  const envPath =
    path.join(
      projectPath,
      ".env"
    );

  const envExamplePath =
    path.join(
      projectPath,
      ".env.example"
    );

  const hasEnv =
    fs.existsSync(envPath);

  const hasEnvExample =
    fs.existsSync(
      envExamplePath
    );

  const envVariables =
    readEnvironmentFile(
      envPath
    );

  const exampleVariables =
    readEnvironmentFile(
      envExamplePath
    );

  /*
   * --------------------------------------------------
   * Check .env
   * --------------------------------------------------
   */

  if (!hasEnv) {
    issues.push({
      severity: "info",

      category: "environment",

      title:
        ".env file not found",

      message:
        "No .env file was found in the project root.",

      suggestion:
        "Create a .env file if your project requires local environment variables.",

      metadata: {
        environmentIssueType:
          "missing-env-file",

        environmentFile:
          ".env"
      }
    });
  } else {
    issues.push({
      severity: "info",

      category: "environment",

      title:
        ".env file detected",

      message:
        `${envVariables.size} environment variables found in .env.`,

      file: ".env",

      metadata: {
        environmentFile:
          ".env"
      }
    });
  }

  /*
   * --------------------------------------------------
   * Check .env.example
   * --------------------------------------------------
   */

  if (!hasEnvExample) {
    issues.push({
      severity: "warning",

      category: "environment",

      title:
        ".env.example not found",

      message:
        "No .env.example file was found in the project root.",

      suggestion:
        "Create .env.example to document the environment variables required by the project.",

      metadata: {
        environmentFile:
          ".env.example"
      }
    });
  } else {
    issues.push({
      severity: "info",

      category: "environment",

      title:
        ".env.example detected",

      message:
        `${exampleVariables.size} environment variables documented.`,

      file: ".env.example",

      metadata: {
        environmentFile:
          ".env.example"
      }
    });
  }

  /*
   * --------------------------------------------------
   * Check .gitignore
   * --------------------------------------------------
   */

  if (
    hasEnv &&
    !isGitignored(
      projectPath,
      ".env"
    )
  ) {
    issues.push({
      severity: "error",

      category: "environment",

      title:
        ".env is not ignored by Git",

      message:
        "The .env file may be committed to the repository.",

      file: ".gitignore",

      suggestion:
        "Add .env to .gitignore to prevent environment secrets from being committed.",

      metadata: {
        environmentIssueType:
          "gitignore-missing",

        environmentFile:
          ".env"
      }
    });
  }

  /*
   * --------------------------------------------------
   * Check source code references
   * --------------------------------------------------
   */

  const references =
    getReferencedVariables(
      projectPath
    );

  /*
   * If source code uses environment
   * variables but .env doesn't exist.
   */
  if (
    references.size > 0 &&
    !hasEnv
  ) {
    for (
      const [
        variable,
        reference
      ] of references
    ) {
      issues.push({
        severity: "warning",

        category: "environment",

        title:
          `${variable} requires environment configuration`,

        message:
          `Environment variable ${variable} is referenced by the source code, but .env was not found.`,

        file:
          reference.file,

        suggestion:
          `Define ${variable} in the appropriate environment configuration.`,

        metadata: {
          envVariable:
            variable,

          line:
            reference.line,

          environmentIssueType:
            "missing-variable"
        }
      });
    }
  }

  /*
   * --------------------------------------------------
   * Check variables against .env
   * --------------------------------------------------
   */

  if (hasEnv) {
    for (
      const [
        variable,
        reference
      ] of references
    ) {
      if (
        envVariables.has(variable)
      ) {
        continue;
      }

      issues.push({
        severity: "warning",

        category: "environment",

        title:
          `${variable} is missing from .env`,

        message:
          `The source code references ${variable}, but it is not defined in .env.`,

        file:
          reference.file,

        suggestion:
          `Add ${variable} to your local environment configuration.`,

        metadata: {
          envVariable:
            variable,

          line:
            reference.line,

          environmentIssueType:
            "missing-variable"
        }
      });
    }
  }

  /*
   * --------------------------------------------------
   * Check .env against .env.example
   * --------------------------------------------------
   */

  if (
    hasEnv &&
    hasEnvExample
  ) {
    for (
      const variable of envVariables
    ) {
      if (
        exampleVariables.has(
          variable
        )
      ) {
        continue;
      }

      issues.push({
        severity: "info",

        category: "environment",

        title:
          `${variable} is not documented in .env.example`,

        message:
          `${variable} exists in .env but is not documented in .env.example.`,

        file:
          ".env.example",

        suggestion:
          `Add ${variable}= to .env.example without exposing the actual secret value.`,

        metadata: {
          envVariable:
            variable,

          environmentIssueType:
            "undocumented-variable",

          environmentFile:
            ".env.example"
        }
      });
    }
  }

  /*
   * --------------------------------------------------
   * Check .env.example against source references
   * --------------------------------------------------
   */

  if (hasEnvExample) {
    for (
      const [
        variable,
        reference
      ] of references
    ) {
      if (
        exampleVariables.has(
          variable
        )
      ) {
        continue;
      }

      issues.push({
        severity: "warning",

        category: "environment",

        title:
          `${variable} is not documented`,

        message:
          `The source code references ${variable}, but it is not listed in .env.example.`,

        file:
          ".env.example",

        suggestion:
          `Add ${variable}= to .env.example.`,

        metadata: {
          envVariable:
            variable,

          line:
            reference.line,

          environmentIssueType:
            "undocumented-variable",

          environmentFile:
            ".env.example"
        }
      });
    }
  }

  /*
   * --------------------------------------------------
   * No environment references
   * --------------------------------------------------
   */

  if (
    references.size === 0 &&
    !hasEnv &&
    !hasEnvExample
  ) {
    issues.push({
      severity: "info",

      category: "environment",

      title:
        "No environment configuration detected",

      message:
        "Lumen did not detect environment variable usage or environment files."
    });
  }

  return issues;
}