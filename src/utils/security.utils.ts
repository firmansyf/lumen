import type { OsvVulnerability } from "../services/osv.service.js";

export function getCvssScore(
  vulnerability: OsvVulnerability
): number | undefined {
  const cvss = vulnerability.severity?.find(
    (item) => item.type === "CVSS_V3"
  );

  if (!cvss?.score) {
    return undefined;
  }

  const match = cvss.score.match(
    /CVSS:3\.\d\/.*?\/(\d+(?:\.\d+)?)$/
  );

  if (!match) {
    return undefined;
  }

  const score = Number(match[1]);

  return Number.isNaN(score)
    ? undefined
    : score;
}

export function getCve(
  vulnerability: OsvVulnerability
): string | undefined {
  return vulnerability.aliases?.find(
    (alias) => alias.startsWith("CVE-")
  );
}

export function getFixedVersion(
  vulnerability: OsvVulnerability
): string | undefined {
  for (const affected of vulnerability.affected ?? []) {
    for (const range of affected.ranges ?? []) {
      for (const event of range.events ?? []) {
        if (event.fixed) {
          return event.fixed;
        }
      }
    }
  }

  return undefined;
}

export function getSecuritySeverity(
  score?: number
): "info" | "warning" | "error" {
  if (score === undefined) {
    return "warning";
  }

  if (score >= 7) {
    return "error";
  }

  if (score >= 4) {
    return "warning";
  }

  return "info";
}