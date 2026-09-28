import fs from "node:fs";
import path from "node:path";

import type { Issue } from "../types/issue.js";

import {
  getInstalledVersion
} from "../services/package.service.js";

import {
  queryOsv
} from "../services/osv.service.js";

import {
  getCve,
  getCvssScore,
  getFixedVersion,
  getSecuritySeverity
} from "../utils/security.utils.js";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function analyzeSecurity(
  projectPath: string
): Promise<Issue[]> {
  const packageJsonPath = path.join(
    projectPath,
    "package.json"
  );

  if (!fs.existsSync(packageJsonPath)) {
    return [];
  }

  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, "utf-8")
  ) as PackageJson;

  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const entries = Object.entries(dependencies);

  const results = await Promise.all(
    entries.map(
      async ([packageName]) => {
        const installedVersion =
          getInstalledVersion(
            projectPath,
            packageName
          );

        if (!installedVersion) {
          return [];
        }

        const vulnerabilities =
          await queryOsv(
            packageName,
            installedVersion
          );

        return vulnerabilities.map(
          (vulnerability): Issue => {
            const cvss =
              getCvssScore(vulnerability);

            const cve =
              getCve(vulnerability);

            const fixedVersion =
              getFixedVersion(vulnerability);

            const severity =
              getSecuritySeverity(cvss);

            const identifier =
              cve ?? vulnerability.id;

            return {
              severity,
              category: "security",

              title:
                `${packageName} has a security vulnerability`,

              message:
                vulnerability.summary ??
                vulnerability.details ??
                `Security advisory ${identifier}`,

              file: "package.json",

              suggestion: fixedVersion
                ? `Update ${packageName} to ${fixedVersion}.`
                : `Review ${identifier} and update ${packageName}.`,

              metadata: {
                advisoryId:
                  vulnerability.id,

                cve,

                cvss,

                installedVersion,

                fixedVersion
              }
            };
          }
        );
      }
    )
  );

  const issues = results.flat();

  if (issues.length === 0) {
    return [
      {
        severity: "info",
        category: "security",
        title: "No vulnerabilities found",
        message:
          "No known vulnerabilities were found in the installed dependencies."
      }
    ];
  }

  return issues;
}