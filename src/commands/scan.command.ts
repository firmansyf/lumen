import path from "node:path";

import pc from "picocolors";

import {
  analyzeProject,
  analyzeDependencies,
  analyzeSecurity,
  analyzeSecrets,
  analyzeEnvironment
} from "../analyzers/index.js";

import {
  printIssue,
  printSummary
} from "../formatters/terminal.formatter.js";

import {
  formatJsonResult
} from "../formatters/json.formatter.js";

import {
  deduplicateIssues,
  groupIssuesByCategory
} from "../utils/issue.utils.js";

import {
  loadLumenConfig
} from "../services/config.service.js";

import type {
  Issue
} from "../types/issue.js";

export interface ScanOptions {
  json?: boolean;
}

export async function scanCommand(
  projectPath = ".",
  options: ScanOptions = {}
) {
  const absolutePath =
    path.resolve(
      projectPath
    );

  /*
   * Load Lumen configuration.
   */

  const config =
    await loadLumenConfig(
      absolutePath
    );

  /*
   * Run analyzers.
   */

  const projectIssues =
    analyzeProject(
      absolutePath
    );

  const dependencyIssues =
    await analyzeDependencies(
      absolutePath
    );

  const securityIssues =
    await analyzeSecurity(
      absolutePath
    );

  const secretIssues =
    analyzeSecrets(
      absolutePath,
      {
        ignore:
          config.ignore
      }
    );

  const environmentIssues =
    analyzeEnvironment(
      absolutePath
    );

  /*
   * Combine issues.
   */

  const rawIssues: Issue[] = [
    ...projectIssues,
    ...dependencyIssues,
    ...securityIssues,
    ...secretIssues,
    ...environmentIssues
  ];

  /*
   * Remove duplicates.
   */

  const issues =
    deduplicateIssues(
      rawIssues
    );

  /*
   * JSON mode.
   */

  if (
    options.json
  ) {
    console.log(
      formatJsonResult(
        issues,
        absolutePath
      )
    );

    if (
      shouldFail(
        issues,
        config.security?.failOn
      )
    ) {
      process.exitCode = 1;
    }

    return;
  }

  /*
   * Terminal mode.
   */

  console.log();

  console.log(
    pc.bold("Lumen")
  );

  console.log(
    pc.dim(
      "Illuminate your code."
    )
  );

  console.log();

  console.log(
    pc.dim(
      `Scanning: ${absolutePath}`
    )
  );

  console.log();

  const grouped =
    groupIssuesByCategory(
      issues
    );

  printCategory(
    "Project",
    grouped.project
  );

  printCategory(
    "Dependencies",
    grouped.dependency
  );

  printCategory(
    "Security",
    grouped.security
  );

  printCategory(
    "Environment",
    grouped.environment
  );

  printCategory(
    "Code",
    grouped.code
  );

  printCategory(
    "Configuration",
    grouped.configuration
  );

  printSummary(
    issues
  );

  if (
    shouldFail(
      issues,
      config.security?.failOn
    )
  ) {
    process.exitCode = 1;
  }
}

function shouldFail(
  issues: Issue[],
  failOn:
    | "error"
    | "warning"
    | "none"
    | undefined
): boolean {
  switch (
    failOn ?? "error"
  ) {
    case "none":
      return false;

    case "warning":
      return issues.some(
        (issue) =>
          issue.severity ===
            "warning" ||
          issue.severity ===
            "error"
      );

    case "error":
    default:
      return issues.some(
        (issue) =>
          issue.severity ===
          "error"
      );
  }
}

function printCategory(
  title: string,
  issues: Issue[]
) {
  if (
    issues.length === 0
  ) {
    return;
  }

  console.log(
    pc.bold(title)
  );

  console.log(
    pc.dim(
      "──────────────────────────────"
    )
  );

  for (
    const issue of issues
  ) {
    printIssue(issue);
  }
}