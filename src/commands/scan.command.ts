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

export interface ScanOptions {
  json?: boolean;
}

export async function scanCommand(
  projectPath = ".",
  options: ScanOptions = {}
) {
  const absolutePath =
    path.resolve(projectPath);

  /*
   * Run all analyzers.
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
      absolutePath
    );

  const environmentIssues =
    analyzeEnvironment(
      absolutePath
    );

  /*
   * Combine all issues.
   */

  const rawIssues = [
    ...projectIssues,
    ...dependencyIssues,
    ...securityIssues,
    ...secretIssues,
    ...environmentIssues
  ];

  /*
   * Remove duplicated issues.
   */

  const issues =
    deduplicateIssues(
      rawIssues
    );

  /*
   * JSON mode.
   */

  if (options.json) {
    console.log(
      formatJsonResult(
        issues,
        absolutePath
      )
    );

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
}

function printCategory(
  title: string,
  issues: import("../types/issue.js").Issue[]
) {
  if (issues.length === 0) {
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

  for (const issue of issues) {
    printIssue(issue);
  }
}