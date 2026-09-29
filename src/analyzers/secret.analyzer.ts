import fs from "node:fs";
import path from "node:path";

import type { Issue } from "../types/issue.js";

import {
  SECRET_PATTERNS
} from "../utils/secret.utils.js";

import {
  loadLumenIgnore,
  shouldIgnorePath
} from "../utils/ignore.utils.js";

function getFiles(
  projectPath: string,
  ignorePatterns: string[]
): string[] {
  const files: string[] = [];

  function walk(
    directory: string
  ) {
    if (
      shouldIgnorePath(
        projectPath,
        directory,
        ignorePatterns
      )
    ) {
      return;
    }

    let entries: fs.Dirent[];

    try {
      entries =
        fs.readdirSync(
          directory,
          {
            withFileTypes: true
          }
        );
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath =
        path.join(
          directory,
          entry.name
        );

      if (
        shouldIgnorePath(
          projectPath,
          fullPath,
          ignorePatterns
        )
      ) {
        continue;
      }

      if (
        entry.isDirectory()
      ) {
        walk(fullPath);
        continue;
      }

      if (
        entry.isFile()
      ) {
        files.push(fullPath);
      }
    }
  }

  walk(projectPath);

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

export function analyzeSecrets(
  projectPath: string
): Issue[] {
  const issues: Issue[] = [];

  const ignorePatterns =
    loadLumenIgnore(
      projectPath
    );

  const files =
    getFiles(
      projectPath,
      ignorePatterns
    );

  for (const filePath of files) {
    let content: string;

    try {
      const stats =
        fs.statSync(filePath);

      /*
       * Ignore files larger than 1 MB.
       */

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

    for (
      const secret of SECRET_PATTERNS
    ) {
      const regex =
        new RegExp(
          secret.pattern.source,
          secret.pattern.flags.includes(
            "g"
          )
            ? secret.pattern.flags
            : `${secret.pattern.flags}g`
        );

      let match:
        RegExpExecArray | null;

      while (
        (match =
          regex.exec(
            content
          )) !== null
      ) {
        const relativePath =
          path.relative(
            projectPath,
            filePath
          );

        const line =
          getLineNumber(
            content,
            match.index
          );

        issues.push({
          severity: "error",

          category: "security",

          title:
            `${secret.name} detected`,

          message:
            `Potential ${secret.name.toLowerCase()} found in ${relativePath}.`,

          file: relativePath,

          suggestion:
            "Remove the secret from source code and store it in environment variables or a secure secret manager.",

          metadata: {
            secretType:
              secret.type,

            line
          }
        });

        /*
         * Prevent infinite loops
         * for zero-length matches.
         */

        if (
          match[0].length === 0
        ) {
          regex.lastIndex++;
        }
      }
    }
  }

  if (
    issues.length === 0
  ) {
    return [
      {
        severity: "info",

        category: "security",

        title:
          "No secrets detected",

        message:
          "No known hardcoded secrets were detected in the scanned files."
      }
    ];
  }

  return issues;
}