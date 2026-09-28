import semver from "semver";

import type {
  DependencyUpdateType
} from "../types/issue.js";

export function getDependencyUpdateType(
  currentVersion: string,
  latestVersion: string
): DependencyUpdateType {
  const diff = semver.diff(
    currentVersion,
    latestVersion
  );

  switch (diff) {
    case "major":
      return "major";

    case "minor":
      return "minor";

    case "patch":
      return "patch";

    case "premajor":
    case "preminor":
    case "prepatch":
    case "prerelease":
      return "prerelease";

    default:
      return "unknown";
  }
}

export function isVersionInRange(
  version: string,
  range: string
): boolean {
  try {
    return semver.satisfies(
      version,
      range
    );
  } catch {
    return false;
  }
}