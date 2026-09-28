export type IssueSeverity =
  | "info"
  | "warning"
  | "error";

export type IssueCategory =
  | "project"
  | "dependency"
  | "code"
  | "security"
  | "environment"
  | "configuration";

export type DependencyUpdateType =
  | "major"
  | "minor"
  | "patch"
  | "prerelease"
  | "unknown";

export type SecretType =
  | "api-key"
  | "jwt"
  | "aws-access-key"
  | "github-token"
  | "private-key"
  | "database-url"
  | "generic-secret";

export type EnvironmentIssueType =
  | "missing-variable"
  | "undocumented-variable"
  | "missing-env-file"
  | "gitignore-missing";

export interface Issue {
  severity: IssueSeverity;

  category: IssueCategory;

  title: string;

  message: string;

  file?: string;

  suggestion?: string;

  metadata?: {
    advisoryId?: string;
    cve?: string;
    cvss?: number;
    declaredVersion?: string;
    installedVersion?: string;
    latestVersion?: string;
    fixedVersion?: string;
    updateType?: DependencyUpdateType;
    secretType?: SecretType;
    line?: number;
    envVariable?: string;
    environmentFile?: string;
    environmentIssueType?: EnvironmentIssueType;
  };
}