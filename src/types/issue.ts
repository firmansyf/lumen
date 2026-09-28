export type IssueSeverity = "info" | "warning" | "error";

export type IssueCategory =
  | "project"
  | "dependency"
  | "code"
  | "security"
  | "environment"
  | "configuration";

export interface Issue {
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  message: string;
  file?: string;
  suggestion?: string;
}