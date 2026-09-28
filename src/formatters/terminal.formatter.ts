import pc from "picocolors";

import type { Issue } from "../types/issue.js";

function getIcon(severity: Issue["severity"]) {
  switch (severity) {
    case "info":
      return pc.green("✓");

    case "warning":
      return pc.yellow("⚠");

    case "error":
      return pc.red("✗");
  }
}

export function printIssue(issue: Issue) {
  const icon = getIcon(issue.severity);

  console.log(`${icon} ${issue.title}`);
  console.log(`  ${issue.message}`);

  if (issue.file) {
    console.log(`  File: ${issue.file}`);
  }

  if (issue.suggestion) {
    console.log(`  Suggestion: ${issue.suggestion}`);
  }

  console.log();
}

export function printSummary(issues: Issue[]) {
  const errors = issues.filter(
    (issue) => issue.severity === "error"
  ).length;

  const warnings = issues.filter(
    (issue) => issue.severity === "warning"
  ).length;

  const infos = issues.filter(
    (issue) => issue.severity === "info"
  ).length;

  console.log(
    pc.dim("──────────────────────────────")
  );

  console.log(
    `${pc.red(`${errors} errors`)} · ` +
    `${pc.yellow(`${warnings} warnings`)} · ` +
    `${pc.green(`${infos} info`)}`
  );

  console.log();
}