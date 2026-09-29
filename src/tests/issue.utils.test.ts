import {
  describe,
  expect,
  it
} from "vitest";

import type {
  Issue
} from "../types/issue.js";

import {
  getIssueKey,
  deduplicateIssues,
  groupIssuesByCategory
} from "../utils/issue.utils.js";

describe(
  "issue.utils",
  () => {
    it(
      "should generate a consistent issue key",
      () => {
        const issue: Issue = {
          severity: "warning",
          category: "dependency",
          title:
            "typescript has an update",
          file: "package.json"
        };

        const key =
          getIssueKey(issue);

        expect(key).toBe(
          "dependency|typescript has an update|package.json|||||"
        );
      }
    );

    it(
      "should generate different keys for different files",
      () => {
        const issueA: Issue = {
          severity: "error",
          category: "security",
          title: "API Key detected",
          file: "src/a.ts",
          metadata: {
            line: 10,
            secretType: "api-key"
          }
        };

        const issueB: Issue = {
          severity: "error",
          category: "security",
          title: "API Key detected",
          file: "src/b.ts",
          metadata: {
            line: 10,
            secretType: "api-key"
          }
        };

        expect(
          getIssueKey(issueA)
        ).not.toBe(
          getIssueKey(issueB)
        );
      }
    );

    it(
      "should remove duplicate issues",
      () => {
        const issue: Issue = {
          severity: "warning",
          category: "environment",
          title:
            "API_KEY is missing",
          file: "src/config.ts",
          metadata: {
            line: 10,
            envVariable: "API_KEY",
            environmentIssueType:
              "missing-variable"
          }
        };

        const duplicate: Issue = {
          ...issue
        };

        const result =
          deduplicateIssues([
            issue,
            duplicate
          ]);

        expect(
          result
        ).toHaveLength(1);
      }
    );

    it(
      "should keep different issues",
      () => {
        const issueA: Issue = {
          severity: "warning",
          category: "environment",
          title:
            "API_KEY is missing",
          file: "src/config.ts",
          metadata: {
            line: 10,
            envVariable: "API_KEY",
            environmentIssueType:
              "missing-variable"
          }
        };

        const issueB: Issue = {
          severity: "warning",
          category: "environment",
          title:
            "DATABASE_URL is missing",
          file: "src/config.ts",
          metadata: {
            line: 11,
            envVariable:
              "DATABASE_URL",
            environmentIssueType:
              "missing-variable"
          }
        };

        const result =
          deduplicateIssues([
            issueA,
            issueB
          ]);

        expect(
          result
        ).toHaveLength(2);
      }
    );

    it(
      "should group issues by category",
      () => {
        const issues: Issue[] = [
          {
            severity: "info",
            category: "project",
            title:
              "Project issue"
          },

          {
            severity: "warning",
            category: "dependency",
            title:
              "Dependency issue"
          },

          {
            severity: "error",
            category: "security",
            title:
              "Security issue"
          },

          {
            severity: "warning",
            category: "environment",
            title:
              "Environment issue"
          }
        ];

        const grouped =
          groupIssuesByCategory(
            issues
          );

        expect(
          grouped.project
        ).toHaveLength(1);

        expect(
          grouped.dependency
        ).toHaveLength(1);

        expect(
          grouped.security
        ).toHaveLength(1);

        expect(
          grouped.environment
        ).toHaveLength(1);

        expect(
          grouped.code
        ).toHaveLength(0);

        expect(
          grouped.configuration
        ).toHaveLength(0);
      }
    );
  }
);