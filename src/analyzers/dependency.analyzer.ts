import fs from "node:fs";
import path from "node:path";

import semver from "semver";

import type { Issue } from "../types/issue.js";
import { getLatestVersion } from "../services/npm-registry.service.js";
import { getInstalledVersion } from "../services/package.service.js";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function analyzeDependencies(
  projectPath: string
): Promise<Issue[]> {
  const issues: Issue[] = [];

  const packageJsonPath = path.join(
    projectPath,
    "package.json"
  );

  if (!fs.existsSync(packageJsonPath)) {
    return issues;
  }

  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, "utf-8")
  ) as PackageJson;

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
      message:
        "This project does not have any npm dependencies.",
      file: "package.json"
    });

    return issues;
  }

  issues.push({
    severity: "info",
    category: "dependency",
    title: "Dependencies detected",
    message:
      `${dependencyEntries.length} dependencies found.`,
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
        message:
          `The dependency is declared in package.json but was not found in node_modules.`,
        file: "package.json",
        suggestion:
          "Run your package manager install command."
      });

      continue;
    }

    const latestVersion =
      await getLatestVersion(packageName);

    if (!latestVersion) {
      issues.push({
        severity: "warning",
        category: "dependency",
        title: `Unable to check ${packageName}`,
        message:
          `Could not retrieve the latest version from npm.`,
        file: "package.json"
      });

      continue;
    }

    const parsedInstalledVersion =
      semver.valid(installedVersion);

    const parsedLatestVersion =
      semver.valid(latestVersion);

    if (
      !parsedInstalledVersion ||
      !parsedLatestVersion
    ) {
      issues.push({
        severity: "warning",
        category: "dependency",
        title: `Unable to compare ${packageName}`,
        message:
          `Could not compare installed and latest versions.`,
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
        message:
          `Installed: ${parsedInstalledVersion} → Latest: ${parsedLatestVersion}`,
        file: "package.json",
        suggestion:
          `Update ${packageName} to ${parsedLatestVersion}.`
      });

      continue;
    }

    issues.push({
      severity: "info",
      category: "dependency",
      title: `${packageName} is up to date`,
      message:
        `Installed: ${parsedInstalledVersion} · Latest: ${parsedLatestVersion}`,
      file: "package.json"
    });
  }

  return issues;
}