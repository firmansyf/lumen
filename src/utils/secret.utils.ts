import type {
  SecretType
} from "../types/issue.js";

export interface SecretPattern {
  type: SecretType;
  name: string;
  pattern: RegExp;
}

export const SECRET_PATTERNS: SecretPattern[] = [
  {
    type: "private-key",
    name: "Private Key",
    pattern:
      /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i
  },

  {
    type: "aws-access-key",
    name: "AWS Access Key",
    pattern:
      /\bAKIA[0-9A-Z]{16}\b/i
  },

  {
    type: "github-token",
    name: "GitHub Token",
    pattern:
      /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/
  },

  {
    type: "jwt",
    name: "JWT",
    pattern:
      /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/
  },

  {
    type: "database-url",
    name: "Database URL",
    pattern:
      /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s"'`]+/i
  },

  {
    type: "api-key",
    name: "API Key",
    pattern:
        /\b[A-Za-z_$]*api[_-]?key\b\s*[:=]\s*["'`][^"'`]{12,}["'`]/i
  },

  {
    type: "generic-secret",
    name: "Generic Secret",
    pattern:
      /\b(?:secret|token|password|passwd|auth[_-]?token)\s*[:=]\s*["'`][^"'`]{8,}["'`]/i
  }
];

export function findSecretPatterns(
  content: string
): SecretPattern[] {
  return SECRET_PATTERNS.filter(
    ({ pattern }) => pattern.test(content)
  );
}