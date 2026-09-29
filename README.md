# Lumen

> Illuminate your code.

Lumen is a developer project health and diagnostics CLI that helps you
discover hidden problems before shipping.

It analyzes your project for:

-   Project configuration
-   Dependency updates
-   Known security vulnerabilities
-   Hardcoded secrets
-   Environment variables
-   Configuration issues

------------------------------------------------------------------------

## Quick Start

The fastest way to use Lumen is with `npx`.

You don't need to install anything globally.

``` bash
npx lumen-cli scan
```

Lumen will scan the current directory and report detected issues.

That's it.

------------------------------------------------------------------------

## Requirements

Before using Lumen, make sure you have:

-   Node.js 20 or newer
-   npm

Check your Node.js version:

``` bash
node --version
```

Check your npm version:

``` bash
npm --version
```

------------------------------------------------------------------------

## Installation

### Option 1 --- Use with npx

Recommended for most users.

``` bash
npx lumen-cli scan
```

You can also scan another project:

``` bash
npx lumen-cli scan ./my-project
```

### Option 2 --- Install globally

If you use Lumen frequently, install it globally:

``` bash
npm install -g lumen-cli
```

Then run:

``` bash
lumen scan
```

Check the installed version:

``` bash
lumen --version
```

------------------------------------------------------------------------

# Basic Usage

## Scan the current project

Open your terminal inside your project:

``` bash
cd my-project
```

Then run:

``` bash
npx lumen-cli scan
```

Example output:

``` text
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

Environment
──────────────────────────────
✓ Environment checks passed

Security
──────────────────────────────
✓ No secrets detected

──────────────────────────────
0 errors · 1 warnings · 6 info
```

The exact results depend on your project.

## Scan another project

``` bash
npx lumen-cli scan ./path/to/project
```

For example:

``` bash
npx lumen-cli scan ../my-app
```

You can also use an absolute path:

``` bash
npx lumen-cli scan /home/user/projects/my-app
```

------------------------------------------------------------------------

# JSON Output

Lumen supports JSON output for automation and CI/CD.

``` bash
npx lumen-cli scan --json
```

Example:

``` json
{
  "tool": "lumen",
  "version": "0.1.0",
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

JSON output is useful for:

-   CI/CD pipelines
-   GitHub Actions
-   Automation
-   Custom developer tools
-   Dashboards
-   Monitoring systems

------------------------------------------------------------------------

# What Does Lumen Check?

## Project

Lumen checks basic project configuration such as:

-   `package.json`
-   Git repository
-   TypeScript configuration

## Dependencies

Lumen checks npm dependencies for:

-   Installed versions
-   Latest versions
-   Major updates
-   Minor updates
-   Patch updates
-   Missing dependencies

## Security

Lumen checks installed npm dependencies against the OSV vulnerability
database.

It can report:

-   Advisory ID
-   CVE
-   CVSS score
-   Installed version
-   Fixed version

## Secret Detection

Lumen scans project files for potential hardcoded secrets.

Examples include:

-   API keys
-   JWT tokens
-   Private keys
-   Other known credential patterns

> Lumen uses pattern-based detection. A detected value may be a false
> positive and should be reviewed before taking action.

## Environment

Lumen analyzes environment variable usage and configuration patterns.

It can help identify:

-   Missing environment variables
-   Potentially unsafe environment usage
-   Environment configuration problems

------------------------------------------------------------------------

# Configuration

Lumen supports an optional configuration file.

Create this file in the root of your project:

``` text
lumen.config.ts
```

Example:

``` ts
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

Then run:

``` bash
npx lumen-cli scan
```

------------------------------------------------------------------------

# Configuration Options

## `ignore`

Additional files or directories to exclude from scanning.

``` ts
export default {
  ignore: [
    "fixtures/",
    "generated/",
    "mock-data/"
  ]
};
```

## `failOn`

Controls when Lumen returns a failing exit code.

### `error`

Default configuration:

``` ts
export default {
  failOn: "error"
};
```

The command fails when an error is detected.

Warnings are still displayed but do not cause the command to fail.

### `warning`

``` ts
export default {
  failOn: "warning"
};
```

The command fails when a warning or error is detected.

### `none`

``` ts
export default {
  failOn: "none"
};
```

Lumen reports issues but does not fail the command.

------------------------------------------------------------------------

# Dependency Configuration

Dependency update checks are enabled by default.

``` ts
export default {
  dependency: {
    checkUpdates: true
  }
};
```

To disable dependency update checks:

``` ts
export default {
  dependency: {
    checkUpdates: false
  }
};
```

------------------------------------------------------------------------

# Security Configuration

Security checks are enabled by default.

``` ts
export default {
  security: {
    enabled: true
  }
};
```

To disable security analysis:

``` ts
export default {
  security: {
    enabled: false
  }
};
```

> Disabling security checks is generally not recommended for CI/CD
> environments.

------------------------------------------------------------------------

# Environment Configuration

Environment checks are enabled by default.

``` ts
export default {
  environment: {
    enabled: true
  }
};
```

To disable environment analysis:

``` ts
export default {
  environment: {
    enabled: false
  }
};
```

------------------------------------------------------------------------

# Ignoring Files with `.lumenignore`

Create a `.lumenignore` file in the root of your project:

``` text
src/tests/
tests/
fixtures/
generated/
mock-data/
```

Lumen will skip matching files and directories during scanning.

## Default Ignored Paths

Lumen automatically ignores common directories such as:

``` text
node_modules/
.git/
dist/
build/
.next/
.expo/
coverage/
.cache/
```

The following lockfiles are also ignored by default:

``` text
package-lock.json
pnpm-lock.yaml
yarn.lock
```

------------------------------------------------------------------------

# Exit Codes

Lumen can be used in CI/CD because it returns an appropriate process
exit code.

  `failOn`    Errors   Warnings   Result
  ----------- -------- ---------- --------------------------------------
  `error`     Fail     Pass       Failed only when errors exist
  `warning`   Fail     Fail       Failed when warnings or errors exist
  `none`      Pass     Pass       Always passes

The default configuration is:

``` text
failOn: "error"
```

For example:

``` text
0 errors · 3 warnings · 10 info
```

will still return a successful exit code when using:

``` ts
failOn: "error"
```

------------------------------------------------------------------------

# GitHub Actions

Lumen can be integrated into GitHub Actions.

Example:

``` yaml
name: Lumen

on:
  push:
    branches:
      - main
      - master

  pull_request:
    branches:
      - main
      - master

jobs:
  lumen:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Lumen
        run: npx lumen-cli scan
```

You can also use JSON output:

``` yaml
- name: Run Lumen
  run: npx lumen-cli scan --json
```

------------------------------------------------------------------------

# Recommended Development Workflow

A simple workflow using Lumen:

``` text
Write code
    ↓
Run tests
    ↓
Run Lumen
    ↓
Fix detected issues
    ↓
Commit
    ↓
Push
    ↓
CI
```

Before pushing changes:

``` bash
pnpm test
npx lumen-cli scan
```

------------------------------------------------------------------------

# CLI Reference

## `scan`

Analyze a project:

``` bash
npx lumen-cli scan
```

Scan another project:

``` bash
npx lumen-cli scan ./my-project
```

### Options

#### `--json`

Return results as JSON:

``` bash
npx lumen-cli scan --json
```

## `--version`

Show the installed Lumen version:

``` bash
npx lumen-cli --version
```

## `--help`

Show available commands and options:

``` bash
npx lumen-cli --help
```

------------------------------------------------------------------------

# Project Structure

``` text
lumen/
├── src/
│   ├── analyzers/
│   │   ├── project.analyzer.ts
│   │   ├── dependency.analyzer.ts
│   │   ├── security.analyzer.ts
│   │   ├── secret.analyzer.ts
│   │   ├── environment.analyzer.ts
│   │   └── index.ts
│   │
│   ├── commands/
│   │   └── scan.command.ts
│   │
│   ├── formatters/
│   │   ├── terminal.formatter.ts
│   │   └── json.formatter.ts
│   │
│   ├── services/
│   │   ├── npm-registry.service.ts
│   │   ├── package.service.ts
│   │   ├── osv.service.ts
│   │   └── config.service.ts
│   │
│   ├── types/
│   │   ├── issue.ts
│   │   └── config.ts
│   │
│   ├── utils/
│   │   ├── security.utils.ts
│   │   ├── dependency.utils.ts
│   │   ├── secret.utils.ts
│   │   ├── environment.utils.ts
│   │   ├── issue.utils.ts
│   │   └── ignore.utils.ts
│   │
│   ├── tests/
│   │
│   └── index.ts
│
├── .github/
│   └── workflows/
│       └── lumen.yml
│
├── .lumenignore
├── lumen.config.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

------------------------------------------------------------------------

# Tech Stack

Lumen is built with:

-   TypeScript
-   Node.js
-   Commander
-   picocolors
-   tsup
-   Vitest
-   npm Registry API
-   OSV API

------------------------------------------------------------------------

# Roadmap

## v0.1.0 --- CLI Foundation

-   [x] CLI
-   [x] Project analyzer
-   [x] Dependency analyzer
-   [x] Security analyzer
-   [x] Secret scanner
-   [x] Environment analyzer
-   [x] JSON output
-   [x] Exit code support
-   [x] `.lumenignore`
-   [x] Configuration
-   [x] Automated tests
-   [x] GitHub Actions
-   [x] npm package

## Future --- Developer Experience

-   Improved scan summary
-   Better issue grouping
-   More actionable recommendations
-   Improved CLI output
-   Better error handling
-   Faster scanning

## Future --- Git-aware Scanning

Lumen will be able to understand Git changes and focus on files changed
by the developer.

Planned usage:

``` bash
lumen scan --changed
```

## Future --- GitHub Integration

Planned GitHub features include:

-   Pull Request checks
-   Pull Request comments
-   File and line annotations
-   CI/CD integration
-   Changed-file analysis

## Future --- Lumen Platform

Long-term plans include:

-   Project dashboard
-   Project history
-   Team insights
-   Issue tracking
-   AI-powered explanations
-   Automated fixes

------------------------------------------------------------------------

# Development

Clone the repository:

``` bash
git clone <repository-url>
cd lumen
```

Install dependencies:

``` bash
pnpm install
```

Run in development:

``` bash
pnpm dev
```

Run tests:

``` bash
pnpm test
```

Run tests in watch mode:

``` bash
pnpm test:watch
```

Build:

``` bash
pnpm build
```

Run the built CLI:

``` bash
node dist/index.js scan
```

------------------------------------------------------------------------

# Contributing

Contributions are welcome.

Before submitting changes, make sure:

``` bash
pnpm test
pnpm build
```

And verify the CLI:

``` bash
node dist/index.js scan
```

For major feature changes, please open an issue first to discuss the
proposed change.

------------------------------------------------------------------------

# Security

If you discover a security vulnerability in Lumen, please avoid publicly
disclosing sensitive details before the issue has been reviewed.

Open a private security report or contact the project maintainer where
appropriate.

------------------------------------------------------------------------

# License

MIT License

Copyright (c) 2026 Yusuf Firmansyah

See the `LICENSE` file for the full license text.

------------------------------------------------------------------------

# Author

Created by Yusuf Firmansyah.

> Illuminate your code.
