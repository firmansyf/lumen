# Lumen

> Illuminate your code.

Lumen is a developer project health and diagnostics CLI that helps you find potential problems before shipping.

It checks your project for:

- Project configuration
- Dependency updates
- Known security vulnerabilities
- Hardcoded secrets
- Environment configuration issues

## Quick Start

Run Lumen without installing it globally:

```bash
npx lumen-cli scan
```

That's it. Lumen scans the current project and reports detected issues.

## Requirements

- Node.js 20 or newer
- npm

Check your versions:

```bash
node --version
npm --version
```

## Installation

### Use with npx — recommended

```bash
npx lumen-cli scan
```

Scan another project:

```bash
npx lumen-cli scan ./my-project
```

### Install globally

```bash
npm install -g lumen-cli
```

Then:

```bash
lumen scan
```

Check the version:

```bash
lumen --version
```

## What Lumen Checks

### Project

Checks basic project configuration, including `package.json`, Git, and TypeScript configuration.

### Dependencies

Checks installed npm dependencies for:

- Available updates
- Major, minor, and patch updates
- Missing dependencies

### Security

Checks installed npm dependencies against the OSV vulnerability database and reports available vulnerability information such as CVE, severity, installed version, and fixed version.

### Secret Detection

Scans project files for potential hardcoded secrets such as API keys, JWT tokens, private keys, and other known credential patterns.

> Secret detection is pattern-based, so results should be reviewed for possible false positives.

### Environment

Checks environment variable usage and configuration patterns to help identify missing or potentially unsafe environment configuration.

## Basic Usage

Scan the current project:

```bash
npx lumen-cli scan
```

Scan another project:

```bash
npx lumen-cli scan ./path/to/project
```

Example output:

```text
Lumen
Illuminate your code.

Scanning: /home/user/my-project

Project
──────────────────────────────
✓ package.json detected
✓ Git repository detected
✓ TypeScript detected

Dependency
──────────────────────────────
✓ Dependencies detected
⚠ react has a minor update available

Security
──────────────────────────────
✓ No vulnerabilities found

Secrets
──────────────────────────────
✓ No secrets detected

Environment
──────────────────────────────
✓ Environment checks passed

──────────────────────────────
0 errors · 1 warnings · 6 info
```

## JSON Output

Use JSON output for CI/CD pipelines and automation:

```bash
npx lumen-cli scan --json
```

Example:

```json
{
  "tool": "lumen",
  "version": "0.1.2",
  "scannedPath": ".",
  "summary": {
    "total": 3,
    "errors": 1,
    "warnings": 1,
    "infos": 1
  },
  "issues": []
}
```

## Configuration

Lumen works without configuration. If you need to customize scanning, create `lumen.config.ts` in the root of your project.

Example:

```ts
export default {
  ignore: [
    "fixtures/",
    "generated/"
  ],
  failOn: "error",
  dependency: {
    checkUpdates: true
  },
  security: {
    enabled: true
  },
  environment: {
    enabled: true
  }
};
```

### `ignore`

Exclude additional files or directories from scanning:

```ts
export default {
  ignore: [
    "fixtures/",
    "generated/",
    "mock-data/"
  ]
};
```

### `failOn`

Controls when Lumen returns a failing exit code:

- `error` — fail only when errors are detected (default)
- `warning` — fail when warnings or errors are detected
- `none` — report issues without failing

Example:

```ts
export default {
  failOn: "warning"
};
```

### Disable specific checks

Dependency updates, security checks, and environment checks can be disabled when needed:

```ts
export default {
  dependency: {
    checkUpdates: false
  },
  security: {
    enabled: false
  },
  environment: {
    enabled: false
  }
};
```

## Ignoring Files with `.lumenignore`

Create a `.lumenignore` file in your project root to exclude files or directories from scanning:

```text
src/tests/
tests/
fixtures/
generated/
mock-data/
```

Lumen already ignores common generated and dependency directories such as:

```text
node_modules/
.git/
dist/
build/
.next/
.expo/
coverage/
.cache/
```

Common lockfiles are also ignored by default:

```text
package-lock.json
pnpm-lock.yaml
yarn.lock
```

## Exit Codes

Lumen can be used in CI/CD because its exit code can be configured with `failOn`.

| `failOn` | Errors | Warnings | Result |
|---|---|---|---|
| `error` | Fail | Pass | Fails only when errors exist |
| `warning` | Fail | Fail | Fails when warnings or errors exist |
| `none` | Pass | Pass | Always passes |

Default:

```ts
failOn: "error"
```

## GitHub Actions

Run Lumen in GitHub Actions:

```yaml
- name: Run Lumen
  run: npx lumen-cli scan
```

For machine-readable results:

```yaml
- name: Run Lumen
  run: npx lumen-cli scan --json
```

## CLI Reference

### Scan a project

```bash
npx lumen-cli scan
```

```bash
npx lumen-cli scan ./my-project
```

### JSON output

```bash
npx lumen-cli scan --json
```

### Show version

```bash
npx lumen-cli --version
```

### Show help

```bash
npx lumen-cli --help
```

## License

MIT License

Copyright (c) 2026 Yusuf Firmansyah

See the `LICENSE` file for the full license text.
