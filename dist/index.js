#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";

// src/commands/scan.command.ts
import path4 from "path";
import pc2 from "picocolors";

// src/analyzers/project.analyzer.ts
import fs from "fs";
import path from "path";
function analyzeProject(projectPath) {
  const issues = [];
  const packageJsonPath = path.join(projectPath, "package.json");
  const gitPath = path.join(projectPath, ".git");
  const tsconfigPath = path.join(projectPath, "tsconfig.json");
  if (fs.existsSync(packageJsonPath)) {
    issues.push({
      severity: "info",
      category: "project",
      title: "package.json detected",
      message: "Node.js project detected.",
      file: "package.json"
    });
  } else {
    issues.push({
      severity: "error",
      category: "project",
      title: "package.json not found",
      message: "Lumen could not find a package.json file.",
      suggestion: "Run `npm init` or `pnpm init`."
    });
  }
  if (fs.existsSync(gitPath)) {
    issues.push({
      severity: "info",
      category: "project",
      title: "Git repository detected",
      message: "Git repository is configured."
    });
  } else {
    issues.push({
      severity: "warning",
      category: "project",
      title: "Git repository not found",
      message: "This project does not appear to be a Git repository.",
      suggestion: "Run `git init` to initialize Git."
    });
  }
  if (fs.existsSync(tsconfigPath)) {
    issues.push({
      severity: "info",
      category: "project",
      title: "TypeScript detected",
      message: "TypeScript configuration found.",
      file: "tsconfig.json"
    });
  }
  return issues;
}

// src/analyzers/dependency.analyzer.ts
import fs3 from "fs";
import path3 from "path";
import semver from "semver";

// src/services/npm-registry.service.ts
async function getLatestVersion(packageName) {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data["dist-tags"]?.latest ?? null;
  } catch {
    return null;
  }
}

// src/services/package.service.ts
import fs2 from "fs";
import path2 from "path";
function getInstalledVersion(projectPath, packageName) {
  const packageJsonPath = path2.join(
    projectPath,
    "node_modules",
    packageName,
    "package.json"
  );
  if (!fs2.existsSync(packageJsonPath)) {
    return null;
  }
  try {
    const packageJson = JSON.parse(
      fs2.readFileSync(packageJsonPath, "utf-8")
    );
    return packageJson.version ?? null;
  } catch {
    return null;
  }
}

// src/analyzers/dependency.analyzer.ts
async function analyzeDependencies(projectPath) {
  const issues = [];
  const packageJsonPath = path3.join(
    projectPath,
    "package.json"
  );
  if (!fs3.existsSync(packageJsonPath)) {
    return issues;
  }
  const packageJson = JSON.parse(
    fs3.readFileSync(packageJsonPath, "utf-8")
  );
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  const dependencyEntries = Object.entries(
    dependencies
  );
  if (dependencyEntries.length === 0) {
    issues.push({
      severity: "info",
      category: "dependency",
      title: "No dependencies found",
      message: "This project does not have any npm dependencies.",
      file: "package.json"
    });
    return issues;
  }
  issues.push({
    severity: "info",
    category: "dependency",
    title: "Dependencies detected",
    message: `${dependencyEntries.length} dependencies found.`,
    file: "package.json"
  });
  for (const [packageName, declaredVersion] of dependencyEntries) {
    const installedVersion = getInstalledVersion(
      projectPath,
      packageName
    );
    if (!installedVersion) {
      issues.push({
        severity: "warning",
        category: "dependency",
        title: `${packageName} is not installed`,
        message: `The dependency is declared in package.json but was not found in node_modules.`,
        file: "package.json",
        suggestion: "Run your package manager install command."
      });
      continue;
    }
    const latestVersion = await getLatestVersion(packageName);
    if (!latestVersion) {
      issues.push({
        severity: "warning",
        category: "dependency",
        title: `Unable to check ${packageName}`,
        message: `Could not retrieve the latest version from npm.`,
        file: "package.json"
      });
      continue;
    }
    const parsedInstalledVersion = semver.valid(installedVersion);
    const parsedLatestVersion = semver.valid(latestVersion);
    if (!parsedInstalledVersion || !parsedLatestVersion) {
      issues.push({
        severity: "warning",
        category: "dependency",
        title: `Unable to compare ${packageName}`,
        message: `Could not compare installed and latest versions.`,
        file: "package.json"
      });
      continue;
    }
    const isOutdated = semver.lt(
      parsedInstalledVersion,
      parsedLatestVersion
    );
    if (isOutdated) {
      issues.push({
        severity: "warning",
        category: "dependency",
        title: `${packageName} is outdated`,
        message: `Installed: ${parsedInstalledVersion} \u2192 Latest: ${parsedLatestVersion}`,
        file: "package.json",
        suggestion: `Update ${packageName} to ${parsedLatestVersion}.`
      });
      continue;
    }
    issues.push({
      severity: "info",
      category: "dependency",
      title: `${packageName} is up to date`,
      message: `Installed: ${parsedInstalledVersion} \xB7 Latest: ${parsedLatestVersion}`,
      file: "package.json"
    });
  }
  return issues;
}

// src/formatters/terminal.formatter.ts
import pc from "picocolors";
function getIcon(severity) {
  switch (severity) {
    case "info":
      return pc.green("\u2713");
    case "warning":
      return pc.yellow("\u26A0");
    case "error":
      return pc.red("\u2717");
  }
}
function printIssue(issue) {
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
function printSummary(issues) {
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
    pc.dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500")
  );
  console.log(
    `${pc.red(`${errors} errors`)} \xB7 ${pc.yellow(`${warnings} warnings`)} \xB7 ${pc.green(`${infos} info`)}`
  );
  console.log();
}

// src/commands/scan.command.ts
async function scanCommand(projectPath = ".") {
  const absolutePath = path4.resolve(projectPath);
  console.log();
  console.log(pc2.bold("Lumen"));
  console.log(pc2.dim("Illuminate your code."));
  console.log();
  console.log(
    pc2.dim(`Scanning: ${absolutePath}`)
  );
  console.log();
  const projectIssues = analyzeProject(absolutePath);
  const dependencyIssues = await analyzeDependencies(absolutePath);
  const issues = [
    ...projectIssues,
    ...dependencyIssues
  ];
  for (const issue of issues) {
    printIssue(issue);
  }
  printSummary(issues);
}

// src/index.ts
var program = new Command();
program.name("lumen").description("Illuminate your code.").version("0.1.0");
program.command("scan").description("Analyze your project").argument("[path]", "Project path", ".").action(scanCommand);
program.parse();
