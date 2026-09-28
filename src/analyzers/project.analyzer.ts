import fs from "node:fs";
import path from "node:path";

import type { Issue } from "../types/issue.js";

export function analyzeProject(projectPath: string): Issue[] {
  const issues: Issue[] = [];

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