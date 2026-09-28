import pc from "picocolors";

import type { Issue } from "../types/issue.js";

function getIcon(
  severity: Issue["severity"]
) {
  switch (severity) {
    case "info":
      return pc.green("✓");

    case "warning":
      return pc.yellow("⚠");

    case "error":
      return pc.red("✗");
  }
}

function getUpdateLabel(
  updateType:
    | NonNullable<Issue["metadata"]>["updateType"]
    | undefined
) {
  switch (updateType) {
    case "major":
      return pc.red("Major update");

    case "minor":
      return pc.yellow("Minor update");

    case "patch":
      return pc.blue("Patch update");

    case "prerelease":
      return pc.magenta("Prerelease update");

    default:
      return pc.yellow("Update available");
  }
}

function printDependencyMetadata(
  issue: Issue
) {
  if (
    issue.category !== "dependency" ||
    !issue.metadata
  ) {
    return;
  }

  const {
    declaredVersion,
    installedVersion,
    latestVersion,
    updateType
  } = issue.metadata;

  if (declaredVersion) {
    console.log(
      `  Declared: ${declaredVersion}`
    );
  }

  if (installedVersion) {
    console.log(
      `  Installed: ${installedVersion}`
    );
  }

  if (latestVersion) {
    console.log(
      `  Latest: ${latestVersion}`
    );
  }

  if (updateType) {
    console.log(
      `  Type: ${getUpdateLabel(updateType)}`
    );
  }
}

function printSecurityMetadata(
  issue: Issue
) {
  if (
    issue.category !== "security" ||
    !issue.metadata
  ) {
    return;
  }

  const metadata = issue.metadata;

  if (metadata.secretType) {
    console.log(
      `  Type: ${metadata.secretType}`
    );
  }

  if (metadata.line) {
    console.log(
      `  Line: ${metadata.line}`
    );
  }

  if (metadata.cve) {
    console.log(
      `  CVE: ${metadata.cve}`
    );
  }

  if (metadata.advisoryId) {
    console.log(
      `  Advisory: ${metadata.advisoryId}`
    );
  }

  if (metadata.cvss !== undefined) {
    console.log(
      `  CVSS: ${metadata.cvss}`
    );
  }

  if (metadata.installedVersion) {
    console.log(
      `  Installed: ${metadata.installedVersion}`
    );
  }

  if (metadata.fixedVersion) {
    console.log(
      `  Fixed in: ${metadata.fixedVersion}`
    );
  }
}

function printEnvironmentMetadata(
  issue: Issue
) {
  if (
    issue.category !== "environment" ||
    !issue.metadata
  ) {
    return;
  }

  if (issue.metadata.envVariable) {
    console.log(
      `  Variable: ${issue.metadata.envVariable}`
    );
  }

  if (issue.metadata.line) {
    console.log(
      `  Line: ${issue.metadata.line}`
    );
  }

  if (
    issue.metadata.environmentFile
  ) {
    console.log(
      `  Environment file: ${issue.metadata.environmentFile}`
    );
  }
}

export function printIssue(
  issue: Issue
) {
  const icon = getIcon(
    issue.severity
  );

  console.log(
    `${icon} ${issue.title}`
  );

  console.log(
    `  ${issue.message}`
  );

  if (issue.file) {
    console.log(
      `  File: ${issue.file}`
    );
  }

  printDependencyMetadata(issue);

  printSecurityMetadata(issue);

  printEnvironmentMetadata(issue);

  if (issue.suggestion) {
    console.log(
      `  Suggestion: ${issue.suggestion}`
    );
  }

  console.log();
}

export function printSummary(
  issues: Issue[]
) {
  const errors = issues.filter(
    (issue) =>
      issue.severity === "error"
  ).length;

  const warnings = issues.filter(
    (issue) =>
      issue.severity === "warning"
  ).length;

  const infos = issues.filter(
    (issue) =>
      issue.severity === "info"
  ).length;

  console.log(
    pc.dim(
      "──────────────────────────────"
    )
  );

  console.log(
    `${pc.red(`${errors} errors`)} · ` +
    `${pc.yellow(`${warnings} warnings`)} · ` +
    `${pc.green(`${infos} info`)}`
  );

  console.log();
}