import type { Issue } from "../types/issue.js";

export function getIssueKey(
  issue: Issue
): string {
  return [
    issue.category,
    issue.title,
    issue.file ?? "",
    issue.metadata?.line ?? "",
    issue.metadata?.envVariable ?? "",
    issue.metadata?.secretType ?? "",
    issue.metadata?.advisoryId ?? "",
    issue.metadata?.cve ?? ""
  ].join("|");
}

export function deduplicateIssues(
  issues: Issue[]
): Issue[] {
  const seen = new Set<string>();
  const result: Issue[] = [];

  for (const issue of issues) {
    const key = getIssueKey(issue);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(issue);
  }

  return result;
}

export function groupIssuesByCategory(
  issues: Issue[]
): Record<Issue["category"], Issue[]> {
  return {
    project: issues.filter(
      (issue) =>
        issue.category === "project"
    ),

    dependency: issues.filter(
      (issue) =>
        issue.category === "dependency"
    ),

    code: issues.filter(
      (issue) =>
        issue.category === "code"
    ),

    security: issues.filter(
      (issue) =>
        issue.category === "security"
    ),

    environment: issues.filter(
      (issue) =>
        issue.category === "environment"
    ),

    configuration: issues.filter(
      (issue) =>
        issue.category === "configuration"
    )
  };
}