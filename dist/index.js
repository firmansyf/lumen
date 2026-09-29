#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";

// src/commands/scan.command.ts
import path9 from "path";
import pc2 from "picocolors";

// src/analyzers/project.analyzer.ts
import fs from "fs";
import path from "path";
function analyzeProject(projectPath) {
  const issues = [];
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

// src/analyzers/dependency.analyzer.ts
import fs3 from "fs";
import path3 from "path";
import semver2 from "semver";

// src/services/npm-registry.service.ts
async function getLatestVersion(packageName) {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data["dist-tags"]?.latest ?? null;
  } catch {
    return null;
  }
}

// src/services/package.service.ts
import fs2 from "fs";
import path2 from "path";
function getInstalledVersion(projectPath, packageName) {
  const packageJsonPath = path2.join(
    projectPath,
    "node_modules",
    packageName,
    "package.json"
  );
  if (!fs2.existsSync(packageJsonPath)) {
    return null;
  }
  try {
    const packageJson = JSON.parse(
      fs2.readFileSync(packageJsonPath, "utf-8")
    );
    return packageJson.version ?? null;
  } catch {
    return null;
  }
}

// src/utils/dependency.utils.ts
import semver from "semver";
function getDependencyUpdateType(currentVersion, latestVersion) {
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
function isVersionInRange(version, range) {
  try {
    return semver.satisfies(
      version,
      range
    );
  } catch {
    return false;
  }
}

// src/analyzers/dependency.analyzer.ts
async function analyzeDependencies(projectPath) {
  const issues = [];
  const packageJsonPath = path3.join(
    projectPath,
    "package.json"
  );
  if (!fs3.existsSync(packageJsonPath)) {
    return issues;
  }
  let packageJson;
  try {
    packageJson = JSON.parse(
      fs3.readFileSync(
        packageJsonPath,
        "utf-8"
      )
    );
  } catch {
    issues.push({
      severity: "error",
      category: "dependency",
      title: "Invalid package.json",
      message: "Lumen could not parse package.json.",
      file: "package.json",
      suggestion: "Check the JSON syntax in package.json."
    });
    return issues;
  }
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  const dependencyEntries = Object.entries(dependencies);
  if (dependencyEntries.length === 0) {
    issues.push({
      severity: "info",
      category: "dependency",
      title: "No dependencies found",
      message: "This project does not have any npm dependencies.",
      file: "package.json"
    });
    return issues;
  }
  issues.push({
    severity: "info",
    category: "dependency",
    title: "Dependencies detected",
    message: `${dependencyEntries.length} dependencies found.`,
    file: "package.json"
  });
  const results = await Promise.all(
    dependencyEntries.map(
      async ([packageName, declaredVersion]) => {
        const installedVersion = getInstalledVersion(
          projectPath,
          packageName
        );
        if (!installedVersion) {
          return {
            severity: "warning",
            category: "dependency",
            title: `${packageName} is not installed`,
            message: `Declared: ${declaredVersion}`,
            file: "package.json",
            suggestion: "Run your package manager install command.",
            metadata: {
              declaredVersion
            }
          };
        }
        const latestVersion = await getLatestVersion(
          packageName
        );
        if (!latestVersion) {
          return {
            severity: "warning",
            category: "dependency",
            title: `Unable to check ${packageName}`,
            message: `Declared: ${declaredVersion} \xB7 Installed: ${installedVersion}`,
            file: "package.json",
            suggestion: "Check your internet connection or npm registry availability.",
            metadata: {
              declaredVersion,
              installedVersion
            }
          };
        }
        const parsedInstalledVersion = semver2.valid(
          installedVersion
        );
        const parsedLatestVersion = semver2.valid(
          latestVersion
        );
        if (!parsedInstalledVersion || !parsedLatestVersion) {
          return {
            severity: "warning",
            category: "dependency",
            title: `Unable to compare ${packageName}`,
            message: `Declared: ${declaredVersion} \xB7 Installed: ${installedVersion} \xB7 Latest: ${latestVersion}`,
            file: "package.json",
            suggestion: "Check the dependency version format.",
            metadata: {
              declaredVersion,
              installedVersion,
              latestVersion
            }
          };
        }
        const installedMatchesDeclared = isVersionInRange(
          parsedInstalledVersion,
          declaredVersion
        );
        if (!installedMatchesDeclared) {
          return {
            severity: "warning",
            category: "dependency",
            title: `${packageName} does not match declared version range`,
            message: `Declared: ${declaredVersion} \xB7 Installed: ${parsedInstalledVersion}`,
            file: "package.json",
            suggestion: `Run your package manager install command to restore ${packageName} to the declared range.`,
            metadata: {
              declaredVersion,
              installedVersion: parsedInstalledVersion
            }
          };
        }
        const isLatestInDeclaredRange = isVersionInRange(
          parsedLatestVersion,
          declaredVersion
        );
        const isOutdated = semver2.lt(
          parsedInstalledVersion,
          parsedLatestVersion
        );
        if (isOutdated) {
          const updateType = getDependencyUpdateType(
            parsedInstalledVersion,
            parsedLatestVersion
          );
          if (!isLatestInDeclaredRange) {
            return {
              severity: updateType === "major" ? "warning" : "info",
              category: "dependency",
              title: `${packageName} has a ${updateType} update outside declared range`,
              message: `Declared: ${declaredVersion} \xB7 Installed: ${parsedInstalledVersion} \xB7 Latest: ${parsedLatestVersion}`,
              file: "package.json",
              suggestion: `Review the ${updateType} upgrade before changing the declared version.`,
              metadata: {
                declaredVersion,
                installedVersion: parsedInstalledVersion,
                latestVersion: parsedLatestVersion,
                updateType
              }
            };
          }
          return {
            severity: "warning",
            category: "dependency",
            title: `${packageName} has a ${updateType} update available`,
            message: `Declared: ${declaredVersion} \xB7 Installed: ${parsedInstalledVersion} \xB7 Latest: ${parsedLatestVersion}`,
            file: "package.json",
            suggestion: `Update ${packageName} to ${parsedLatestVersion}.`,
            metadata: {
              declaredVersion,
              installedVersion: parsedInstalledVersion,
              latestVersion: parsedLatestVersion,
              updateType
            }
          };
        }
        return {
          severity: "info",
          category: "dependency",
          title: `${packageName} is up to date`,
          message: `Declared: ${declaredVersion} \xB7 Installed: ${parsedInstalledVersion} \xB7 Latest: ${parsedLatestVersion}`,
          file: "package.json",
          metadata: {
            declaredVersion,
            installedVersion: parsedInstalledVersion,
            latestVersion: parsedLatestVersion
          }
        };
      }
    )
  );
  issues.push(...results);
  return issues;
}

// src/analyzers/security.analyzer.ts
import fs4 from "fs";
import path4 from "path";

// src/services/osv.service.ts
async function queryOsv(packageName, version) {
  const query = {
    package: {
      ecosystem: "npm",
      name: packageName
    },
    version
  };
  try {
    const response = await fetch(
      "https://api.osv.dev/v1/query",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(query)
      }
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.vulns ?? [];
  } catch {
    return [];
  }
}

// src/utils/security.utils.ts
function getCvssScore(vulnerability) {
  const cvss = vulnerability.severity?.find(
    (item) => item.type === "CVSS_V3"
  );
  if (!cvss?.score) {
    return void 0;
  }
  const match = cvss.score.match(
    /CVSS:3\.\d\/.*?\/(\d+(?:\.\d+)?)$/
  );
  if (!match) {
    return void 0;
  }
  const score = Number(match[1]);
  return Number.isNaN(score) ? void 0 : score;
}
function getCve(vulnerability) {
  return vulnerability.aliases?.find(
    (alias) => alias.startsWith("CVE-")
  );
}
function getFixedVersion(vulnerability) {
  for (const affected of vulnerability.affected ?? []) {
    for (const range of affected.ranges ?? []) {
      for (const event of range.events ?? []) {
        if (event.fixed) {
          return event.fixed;
        }
      }
    }
  }
  return void 0;
}
function getSecuritySeverity(score) {
  if (score === void 0) {
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

// src/analyzers/security.analyzer.ts
async function analyzeSecurity(projectPath) {
  const packageJsonPath = path4.join(
    projectPath,
    "package.json"
  );
  if (!fs4.existsSync(packageJsonPath)) {
    return [];
  }
  const packageJson = JSON.parse(
    fs4.readFileSync(packageJsonPath, "utf-8")
  );
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  const entries = Object.entries(dependencies);
  const results = await Promise.all(
    entries.map(
      async ([packageName]) => {
        const installedVersion = getInstalledVersion(
          projectPath,
          packageName
        );
        if (!installedVersion) {
          return [];
        }
        const vulnerabilities = await queryOsv(
          packageName,
          installedVersion
        );
        return vulnerabilities.map(
          (vulnerability) => {
            const cvss = getCvssScore(vulnerability);
            const cve = getCve(vulnerability);
            const fixedVersion = getFixedVersion(vulnerability);
            const severity = getSecuritySeverity(cvss);
            const identifier = cve ?? vulnerability.id;
            return {
              severity,
              category: "security",
              title: `${packageName} has a security vulnerability`,
              message: vulnerability.summary ?? vulnerability.details ?? `Security advisory ${identifier}`,
              file: "package.json",
              suggestion: fixedVersion ? `Update ${packageName} to ${fixedVersion}.` : `Review ${identifier} and update ${packageName}.`,
              metadata: {
                advisoryId: vulnerability.id,
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
        message: "No known vulnerabilities were found in the installed dependencies."
      }
    ];
  }
  return issues;
}

// src/analyzers/secret.analyzer.ts
import fs6 from "fs";
import path6 from "path";

// src/utils/secret.utils.ts
var SECRET_PATTERNS = [
  {
    type: "private-key",
    name: "Private Key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/i
  },
  {
    type: "aws-access-key",
    name: "AWS Access Key",
    pattern: /\bAKIA[0-9A-Z]{16}\b/i
  },
  {
    type: "github-token",
    name: "GitHub Token",
    pattern: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/
  },
  {
    type: "jwt",
    name: "JWT",
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/
  },
  {
    type: "database-url",
    name: "Database URL",
    pattern: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s"'`]+/i
  },
  {
    type: "api-key",
    name: "API Key",
    pattern: /\b[A-Za-z_$]*api[_-]?key\b\s*[:=]\s*["'`][^"'`]{12,}["'`]/i
  },
  {
    type: "generic-secret",
    name: "Generic Secret",
    pattern: /\b(?:secret|token|password|passwd|auth[_-]?token)\s*[:=]\s*["'`][^"'`]{8,}["'`]/i
  }
];

// src/utils/ignore.utils.ts
import fs5 from "fs";
import path5 from "path";
var DEFAULT_IGNORED_DIRECTORIES = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".expo",
  "coverage",
  ".cache"
]);
var DEFAULT_IGNORED_FILES = /* @__PURE__ */ new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock"
]);
function normalizePath(value) {
  return value.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/^\/+/, "");
}
function loadLumenIgnore(projectPath) {
  const ignorePath = path5.join(
    projectPath,
    ".lumenignore"
  );
  if (!fs5.existsSync(
    ignorePath
  )) {
    return [];
  }
  try {
    return fs5.readFileSync(
      ignorePath,
      "utf-8"
    ).split(/\r?\n/).map(
      (line) => line.trim()
    ).filter(
      (line) => line.length > 0 && !line.startsWith("#")
    );
  } catch {
    return [];
  }
}
function mergeIgnorePatterns(lumenIgnore, configIgnore) {
  return [
    .../* @__PURE__ */ new Set([
      ...lumenIgnore,
      ...configIgnore
    ])
  ];
}
function globToRegExp(pattern) {
  let regex = "";
  let index = 0;
  while (index < pattern.length) {
    const char = pattern[index];
    if (char === "*") {
      if (pattern[index + 1] === "*") {
        regex += ".*";
        index += 2;
        continue;
      }
      regex += "[^/]*";
      index++;
      continue;
    }
    if (char === "?") {
      regex += "[^/]";
      index++;
      continue;
    }
    regex += char.replace(
      /[.+^${}()|[\]\\]/g,
      "\\$&"
    );
    index++;
  }
  return new RegExp(
    `^${regex}$`
  );
}
function matchesPattern(relativePath, pattern) {
  const normalizedPath = normalizePath(
    relativePath
  );
  let normalizedPattern = normalizePath(
    pattern
  );
  const isDirectoryPattern = normalizedPattern.endsWith(
    "/"
  );
  if (isDirectoryPattern) {
    normalizedPattern = normalizedPattern.replace(
      /\/+$/,
      ""
    );
  }
  if (isDirectoryPattern) {
    return normalizedPath === normalizedPattern || normalizedPath.startsWith(
      `${normalizedPattern}/`
    );
  }
  if (!normalizedPattern.includes(
    "/"
  )) {
    const parts = normalizedPath.split(
      "/"
    );
    const regex = globToRegExp(
      normalizedPattern
    );
    return parts.some(
      (part) => regex.test(part)
    );
  }
  return globToRegExp(
    normalizedPattern
  ).test(
    normalizedPath
  );
}
function shouldIgnorePath(projectPath, filePath, ignorePatterns = []) {
  const relativePath = normalizePath(
    path5.relative(
      projectPath,
      filePath
    )
  );
  if (relativePath === "" || relativePath.startsWith(
    "../"
  )) {
    return true;
  }
  const parts = relativePath.split(
    "/"
  );
  if (parts.some(
    (part) => DEFAULT_IGNORED_DIRECTORIES.has(
      part
    )
  )) {
    return true;
  }
  const fileName = path5.basename(
    relativePath
  );
  if (DEFAULT_IGNORED_FILES.has(
    fileName
  )) {
    return true;
  }
  return ignorePatterns.some(
    (pattern) => matchesPattern(
      relativePath,
      pattern
    )
  );
}

// src/analyzers/secret.analyzer.ts
function getFiles(projectPath, ignorePatterns) {
  const files = [];
  function walk(directory) {
    if (shouldIgnorePath(
      projectPath,
      directory,
      ignorePatterns
    )) {
      return;
    }
    let entries;
    try {
      entries = fs6.readdirSync(
        directory,
        {
          withFileTypes: true
        }
      );
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path6.join(
        directory,
        entry.name
      );
      if (shouldIgnorePath(
        projectPath,
        fullPath,
        ignorePatterns
      )) {
        continue;
      }
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile()) {
        files.push(
          fullPath
        );
      }
    }
  }
  walk(projectPath);
  return files;
}
function getLineNumber(content, index) {
  return content.slice(0, index).split("\n").length;
}
function analyzeSecrets(projectPath, options = {}) {
  const issues = [];
  const fileIgnore = loadLumenIgnore(
    projectPath
  );
  const ignorePatterns = mergeIgnorePatterns(
    fileIgnore,
    options.ignore ?? []
  );
  const files = getFiles(
    projectPath,
    ignorePatterns
  );
  for (const filePath of files) {
    let content;
    try {
      const stats = fs6.statSync(
        filePath
      );
      if (stats.size > 1024 * 1024) {
        continue;
      }
      content = fs6.readFileSync(
        filePath,
        "utf-8"
      );
    } catch {
      continue;
    }
    for (const secret of SECRET_PATTERNS) {
      const regex = new RegExp(
        secret.pattern.source,
        secret.pattern.flags.includes(
          "g"
        ) ? secret.pattern.flags : `${secret.pattern.flags}g`
      );
      let match;
      while ((match = regex.exec(
        content
      )) !== null) {
        const relativePath = path6.relative(
          projectPath,
          filePath
        );
        const line = getLineNumber(
          content,
          match.index
        );
        issues.push({
          severity: "error",
          category: "security",
          title: `${secret.name} detected`,
          message: `Potential ${secret.name.toLowerCase()} found in ${relativePath}.`,
          file: relativePath,
          suggestion: "Remove the secret from source code and store it in environment variables or a secure secret manager.",
          metadata: {
            secretType: secret.type,
            line
          }
        });
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    }
  }
  if (issues.length === 0) {
    return [
      {
        severity: "info",
        category: "security",
        title: "No secrets detected",
        message: "No known hardcoded secrets were detected in the scanned files."
      }
    ];
  }
  return issues;
}

// src/analyzers/environment.analyzer.ts
import fs8 from "fs";
import path7 from "path";

// src/utils/environment.utils.ts
import fs7 from "fs";
function parseEnvironmentVariables(content) {
  const variables = /* @__PURE__ */ new Set();
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }
    const match = trimmedLine.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/
    );
    if (!match) {
      continue;
    }
    variables.add(match[1]);
  }
  return variables;
}
function readEnvironmentFile(filePath) {
  if (!fs7.existsSync(filePath)) {
    return /* @__PURE__ */ new Set();
  }
  try {
    const content = fs7.readFileSync(
      filePath,
      "utf-8"
    );
    return parseEnvironmentVariables(
      content
    );
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function extractEnvironmentVariables(content) {
  const variables = /* @__PURE__ */ new Set();
  const processEnvRegex = /\bprocess\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;
  let match;
  while ((match = processEnvRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }
  const importMetaEnvRegex = /\bimport\.meta\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;
  while ((match = importMetaEnvRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }
  return variables;
}

// src/analyzers/environment.analyzer.ts
var IGNORED_DIRECTORIES = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".expo",
  "coverage",
  ".cache"
]);
var IGNORED_FILES = /* @__PURE__ */ new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock"
]);
var SOURCE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts"
]);
function shouldIgnore(filePath) {
  const parts = filePath.split(path7.sep);
  if (parts.some(
    (part) => IGNORED_DIRECTORIES.has(part)
  )) {
    return true;
  }
  return IGNORED_FILES.has(
    path7.basename(filePath)
  );
}
function getSourceFiles(directory) {
  const files = [];
  if (shouldIgnore(directory)) {
    return files;
  }
  let entries;
  try {
    entries = fs8.readdirSync(
      directory,
      {
        withFileTypes: true
      }
    );
  } catch {
    return files;
  }
  for (const entry of entries) {
    const fullPath = path7.join(
      directory,
      entry.name
    );
    if (shouldIgnore(fullPath)) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(
        ...getSourceFiles(
          fullPath
        )
      );
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    const extension = path7.extname(entry.name);
    if (SOURCE_EXTENSIONS.has(
      extension
    )) {
      files.push(fullPath);
    }
  }
  return files;
}
function getLineNumber2(content, index) {
  return content.slice(0, index).split("\n").length;
}
function getReferencedVariables(projectPath) {
  const references = /* @__PURE__ */ new Map();
  const files = getSourceFiles(
    projectPath
  );
  for (const filePath of files) {
    let content;
    try {
      const stats = fs8.statSync(filePath);
      if (stats.size > 1024 * 1024) {
        continue;
      }
      content = fs8.readFileSync(
        filePath,
        "utf-8"
      );
    } catch {
      continue;
    }
    const variables = extractEnvironmentVariables(
      content
    );
    for (const variable of variables) {
      if (references.has(variable)) {
        continue;
      }
      const processRegex = new RegExp(
        `\\bprocess\\.env\\.${variable}\\b`
      );
      const importMetaRegex = new RegExp(
        `\\bimport\\.meta\\.env\\.${variable}\\b`
      );
      const processMatch = processRegex.exec(content);
      const importMetaMatch = importMetaRegex.exec(content);
      const match = processMatch ?? importMetaMatch;
      if (!match) {
        continue;
      }
      const relativePath = path7.relative(
        projectPath,
        filePath
      );
      references.set(
        variable,
        {
          file: relativePath,
          line: getLineNumber2(
            content,
            match.index
          )
        }
      );
    }
  }
  return references;
}
function isGitignored(projectPath, target) {
  const gitignorePath = path7.join(
    projectPath,
    ".gitignore"
  );
  if (!fs8.existsSync(
    gitignorePath
  )) {
    return false;
  }
  let content;
  try {
    content = fs8.readFileSync(
      gitignorePath,
      "utf-8"
    );
  } catch {
    return false;
  }
  const lines = content.split("\n");
  const normalizedTarget = target.replace(
    /^\//,
    ""
  );
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const normalized = trimmed.replace(
      /^\//,
      ""
    ).replace(
      /\/$/,
      ""
    );
    if (normalized === normalizedTarget) {
      return true;
    }
    if (normalized === ".env*" && normalizedTarget.startsWith(
      ".env"
    )) {
      return true;
    }
    if (normalized === "*.env" && normalizedTarget.endsWith(
      ".env"
    )) {
      return true;
    }
  }
  return false;
}
function analyzeEnvironment(projectPath) {
  const issues = [];
  const envPath = path7.join(
    projectPath,
    ".env"
  );
  const envExamplePath = path7.join(
    projectPath,
    ".env.example"
  );
  const hasEnv = fs8.existsSync(envPath);
  const hasEnvExample = fs8.existsSync(
    envExamplePath
  );
  const envVariables = readEnvironmentFile(
    envPath
  );
  const exampleVariables = readEnvironmentFile(
    envExamplePath
  );
  if (!hasEnv) {
    issues.push({
      severity: "info",
      category: "environment",
      title: ".env file not found",
      message: "No .env file was found in the project root.",
      suggestion: "Create a .env file if your project requires local environment variables.",
      metadata: {
        environmentIssueType: "missing-env-file",
        environmentFile: ".env"
      }
    });
  } else {
    issues.push({
      severity: "info",
      category: "environment",
      title: ".env file detected",
      message: `${envVariables.size} environment variables found in .env.`,
      file: ".env",
      metadata: {
        environmentFile: ".env"
      }
    });
  }
  if (!hasEnvExample) {
    issues.push({
      severity: "warning",
      category: "environment",
      title: ".env.example not found",
      message: "No .env.example file was found in the project root.",
      suggestion: "Create .env.example to document the environment variables required by the project.",
      metadata: {
        environmentFile: ".env.example"
      }
    });
  } else {
    issues.push({
      severity: "info",
      category: "environment",
      title: ".env.example detected",
      message: `${exampleVariables.size} environment variables documented.`,
      file: ".env.example",
      metadata: {
        environmentFile: ".env.example"
      }
    });
  }
  if (hasEnv && !isGitignored(
    projectPath,
    ".env"
  )) {
    issues.push({
      severity: "error",
      category: "environment",
      title: ".env is not ignored by Git",
      message: "The .env file may be committed to the repository.",
      file: ".gitignore",
      suggestion: "Add .env to .gitignore to prevent environment secrets from being committed.",
      metadata: {
        environmentIssueType: "gitignore-missing",
        environmentFile: ".env"
      }
    });
  }
  const references = getReferencedVariables(
    projectPath
  );
  if (references.size > 0 && !hasEnv) {
    for (const [
      variable,
      reference
    ] of references) {
      issues.push({
        severity: "warning",
        category: "environment",
        title: `${variable} requires environment configuration`,
        message: `Environment variable ${variable} is referenced by the source code, but .env was not found.`,
        file: reference.file,
        suggestion: `Define ${variable} in the appropriate environment configuration.`,
        metadata: {
          envVariable: variable,
          line: reference.line,
          environmentIssueType: "missing-variable"
        }
      });
    }
  }
  if (hasEnv) {
    for (const [
      variable,
      reference
    ] of references) {
      if (envVariables.has(variable)) {
        continue;
      }
      issues.push({
        severity: "warning",
        category: "environment",
        title: `${variable} is missing from .env`,
        message: `The source code references ${variable}, but it is not defined in .env.`,
        file: reference.file,
        suggestion: `Add ${variable} to your local environment configuration.`,
        metadata: {
          envVariable: variable,
          line: reference.line,
          environmentIssueType: "missing-variable"
        }
      });
    }
  }
  if (hasEnv && hasEnvExample) {
    for (const variable of envVariables) {
      if (exampleVariables.has(
        variable
      )) {
        continue;
      }
      issues.push({
        severity: "info",
        category: "environment",
        title: `${variable} is not documented in .env.example`,
        message: `${variable} exists in .env but is not documented in .env.example.`,
        file: ".env.example",
        suggestion: `Add ${variable}= to .env.example without exposing the actual secret value.`,
        metadata: {
          envVariable: variable,
          environmentIssueType: "undocumented-variable",
          environmentFile: ".env.example"
        }
      });
    }
  }
  if (hasEnvExample) {
    for (const [
      variable,
      reference
    ] of references) {
      if (exampleVariables.has(
        variable
      )) {
        continue;
      }
      issues.push({
        severity: "warning",
        category: "environment",
        title: `${variable} is not documented`,
        message: `The source code references ${variable}, but it is not listed in .env.example.`,
        file: ".env.example",
        suggestion: `Add ${variable}= to .env.example.`,
        metadata: {
          envVariable: variable,
          line: reference.line,
          environmentIssueType: "undocumented-variable",
          environmentFile: ".env.example"
        }
      });
    }
  }
  if (references.size === 0 && !hasEnv && !hasEnvExample) {
    issues.push({
      severity: "info",
      category: "environment",
      title: "No environment configuration detected",
      message: "Lumen did not detect environment variable usage or environment files."
    });
  }
  return issues;
}

// src/formatters/terminal.formatter.ts
import pc from "picocolors";
function getIcon(severity) {
  switch (severity) {
    case "info":
      return pc.green("\u2713");
    case "warning":
      return pc.yellow("\u26A0");
    case "error":
      return pc.red("\u2717");
  }
}
function getUpdateLabel(updateType) {
  switch (updateType) {
    case "major":
      return pc.red("Major update");
    case "minor":
      return pc.yellow("Minor update");
    case "patch":
      return pc.blue("Patch update");
    case "prerelease":
      return pc.magenta("Prerelease update");
    default:
      return pc.yellow("Update available");
  }
}
function printDependencyMetadata(issue) {
  if (issue.category !== "dependency" || !issue.metadata) {
    return;
  }
  const {
    declaredVersion,
    installedVersion,
    latestVersion,
    updateType
  } = issue.metadata;
  if (declaredVersion) {
    console.log(
      `  Declared: ${declaredVersion}`
    );
  }
  if (installedVersion) {
    console.log(
      `  Installed: ${installedVersion}`
    );
  }
  if (latestVersion) {
    console.log(
      `  Latest: ${latestVersion}`
    );
  }
  if (updateType) {
    console.log(
      `  Type: ${getUpdateLabel(updateType)}`
    );
  }
}
function printSecurityMetadata(issue) {
  if (issue.category !== "security" || !issue.metadata) {
    return;
  }
  const metadata = issue.metadata;
  if (metadata.secretType) {
    console.log(
      `  Type: ${metadata.secretType}`
    );
  }
  if (metadata.line) {
    console.log(
      `  Line: ${metadata.line}`
    );
  }
  if (metadata.cve) {
    console.log(
      `  CVE: ${metadata.cve}`
    );
  }
  if (metadata.advisoryId) {
    console.log(
      `  Advisory: ${metadata.advisoryId}`
    );
  }
  if (metadata.cvss !== void 0) {
    console.log(
      `  CVSS: ${metadata.cvss}`
    );
  }
  if (metadata.installedVersion) {
    console.log(
      `  Installed: ${metadata.installedVersion}`
    );
  }
  if (metadata.fixedVersion) {
    console.log(
      `  Fixed in: ${metadata.fixedVersion}`
    );
  }
}
function printEnvironmentMetadata(issue) {
  if (issue.category !== "environment" || !issue.metadata) {
    return;
  }
  if (issue.metadata.envVariable) {
    console.log(
      `  Variable: ${issue.metadata.envVariable}`
    );
  }
  if (issue.metadata.line) {
    console.log(
      `  Line: ${issue.metadata.line}`
    );
  }
  if (issue.metadata.environmentFile) {
    console.log(
      `  Environment file: ${issue.metadata.environmentFile}`
    );
  }
}
function printIssue(issue) {
  const icon = getIcon(
    issue.severity
  );
  console.log(
    `${icon} ${issue.title}`
  );
  console.log(
    `  ${issue.message}`
  );
  if (issue.file) {
    console.log(
      `  File: ${issue.file}`
    );
  }
  printDependencyMetadata(issue);
  printSecurityMetadata(issue);
  printEnvironmentMetadata(issue);
  if (issue.suggestion) {
    console.log(
      `  Suggestion: ${issue.suggestion}`
    );
  }
  console.log();
}
function printSummary(issues) {
  const errors = issues.filter(
    (issue) => issue.severity === "error"
  ).length;
  const warnings = issues.filter(
    (issue) => issue.severity === "warning"
  ).length;
  const infos = issues.filter(
    (issue) => issue.severity === "info"
  ).length;
  console.log(
    pc.dim(
      "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"
    )
  );
  console.log(
    `${pc.red(`${errors} errors`)} \xB7 ${pc.yellow(`${warnings} warnings`)} \xB7 ${pc.green(`${infos} info`)}`
  );
  console.log();
}

// src/formatters/json.formatter.ts
function formatJsonResult(issues, scannedPath) {
  const errors = issues.filter(
    (issue) => issue.severity === "error"
  ).length;
  const warnings = issues.filter(
    (issue) => issue.severity === "warning"
  ).length;
  const infos = issues.filter(
    (issue) => issue.severity === "info"
  ).length;
  const result = {
    tool: "lumen",
    version: "0.1.0",
    scannedPath,
    summary: {
      total: issues.length,
      errors,
      warnings,
      infos
    },
    issues
  };
  return JSON.stringify(
    result,
    null,
    2
  );
}

// src/utils/issue.utils.ts
function getIssueKey(issue) {
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
function deduplicateIssues(issues) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
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
function groupIssuesByCategory(issues) {
  return {
    project: issues.filter(
      (issue) => issue.category === "project"
    ),
    dependency: issues.filter(
      (issue) => issue.category === "dependency"
    ),
    code: issues.filter(
      (issue) => issue.category === "code"
    ),
    security: issues.filter(
      (issue) => issue.category === "security"
    ),
    environment: issues.filter(
      (issue) => issue.category === "environment"
    ),
    configuration: issues.filter(
      (issue) => issue.category === "configuration"
    )
  };
}

// src/services/config.service.ts
import fs9 from "fs";
import path8 from "path";
import { pathToFileURL } from "url";
var CONFIG_FILES = [
  "lumen.config.ts",
  "lumen.config.mts",
  "lumen.config.js",
  "lumen.config.mjs"
];
var DEFAULT_CONFIG = {
  ignore: [],
  security: {
    failOn: "error"
  }
};
async function loadLumenConfig(projectPath) {
  const configPath = findConfigFile(projectPath);
  if (!configPath) {
    return {
      ...DEFAULT_CONFIG,
      security: {
        ...DEFAULT_CONFIG.security
      }
    };
  }
  try {
    const module = await import(pathToFileURL(
      configPath
    ).href);
    const userConfig = module.default ?? module;
    return normalizeConfig(
      userConfig
    );
  } catch (error) {
    console.warn(
      `Warning: Unable to load ${path8.basename(configPath)}.`
    );
    if (error instanceof Error) {
      console.warn(
        `  ${error.message}`
      );
    }
    return {
      ...DEFAULT_CONFIG,
      security: {
        ...DEFAULT_CONFIG.security
      }
    };
  }
}
function findConfigFile(projectPath) {
  for (const fileName of CONFIG_FILES) {
    const configPath = path8.join(
      projectPath,
      fileName
    );
    if (fs9.existsSync(configPath)) {
      return configPath;
    }
  }
  return null;
}
function normalizeConfig(config) {
  if (!config || typeof config !== "object") {
    return {
      ...DEFAULT_CONFIG,
      security: {
        ...DEFAULT_CONFIG.security
      }
    };
  }
  const raw = config;
  const rawSecurity = raw.security;
  let failOn = DEFAULT_CONFIG.security?.failOn;
  if (rawSecurity && typeof rawSecurity === "object") {
    const security = rawSecurity;
    if (security.failOn === "error" || security.failOn === "warning" || security.failOn === "none") {
      failOn = security.failOn;
    }
  }
  const ignore = Array.isArray(
    raw.ignore
  ) ? raw.ignore.filter(
    (value) => typeof value === "string"
  ) : [];
  return {
    ignore,
    security: {
      failOn
    }
  };
}

// src/commands/scan.command.ts
async function scanCommand(projectPath = ".", options = {}) {
  const absolutePath = path9.resolve(
    projectPath
  );
  const config = await loadLumenConfig(
    absolutePath
  );
  const projectIssues = analyzeProject(
    absolutePath
  );
  const dependencyIssues = await analyzeDependencies(
    absolutePath
  );
  const securityIssues = await analyzeSecurity(
    absolutePath
  );
  const secretIssues = analyzeSecrets(
    absolutePath,
    {
      ignore: config.ignore
    }
  );
  const environmentIssues = analyzeEnvironment(
    absolutePath
  );
  const rawIssues = [
    ...projectIssues,
    ...dependencyIssues,
    ...securityIssues,
    ...secretIssues,
    ...environmentIssues
  ];
  const issues = deduplicateIssues(
    rawIssues
  );
  if (options.json) {
    console.log(
      formatJsonResult(
        issues,
        absolutePath
      )
    );
    if (shouldFail(
      issues,
      config.security?.failOn
    )) {
      process.exitCode = 1;
    }
    return;
  }
  console.log();
  console.log(
    pc2.bold("Lumen")
  );
  console.log(
    pc2.dim(
      "Illuminate your code."
    )
  );
  console.log();
  console.log(
    pc2.dim(
      `Scanning: ${absolutePath}`
    )
  );
  console.log();
  const grouped = groupIssuesByCategory(
    issues
  );
  printCategory(
    "Project",
    grouped.project
  );
  printCategory(
    "Dependencies",
    grouped.dependency
  );
  printCategory(
    "Security",
    grouped.security
  );
  printCategory(
    "Environment",
    grouped.environment
  );
  printCategory(
    "Code",
    grouped.code
  );
  printCategory(
    "Configuration",
    grouped.configuration
  );
  printSummary(
    issues
  );
  if (shouldFail(
    issues,
    config.security?.failOn
  )) {
    process.exitCode = 1;
  }
}
function shouldFail(issues, failOn) {
  switch (failOn ?? "error") {
    case "none":
      return false;
    case "warning":
      return issues.some(
        (issue) => issue.severity === "warning" || issue.severity === "error"
      );
    case "error":
    default:
      return issues.some(
        (issue) => issue.severity === "error"
      );
  }
}
function printCategory(title, issues) {
  if (issues.length === 0) {
    return;
  }
  console.log(
    pc2.bold(title)
  );
  console.log(
    pc2.dim(
      "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"
    )
  );
  for (const issue of issues) {
    printIssue(issue);
  }
}

// src/index.ts
var program = new Command();
program.name("lumen").description(
  "Illuminate your code."
).version("0.1.0");
program.command("scan").description(
  "Analyze your project"
).argument(
  "[path]",
  "Project path",
  "."
).option(
  "--json",
  "Output scan results as JSON"
).action(
  async (path10, options) => {
    await scanCommand(
      path10,
      options
    );
  }
);
program.parse();
