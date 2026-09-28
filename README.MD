# Lumen

> Illuminate your code.

Lumen is a developer-focused project health and security scanner designed to help developers discover hidden problems before shipping.

It analyzes your project across dependencies, security vulnerabilities, hardcoded secrets, environment configuration, and project configuration.

---

## ✨ Features

Lumen currently provides:

- 📦 Project analysis
- 🔄 Dependency update analysis
- 🧩 Dependency compatibility analysis
- 🔐 Security vulnerability scanning
- 🔑 Hardcoded secret detection
- 🌎 Environment variable analysis
- 🧹 Issue deduplication
- 📊 Category-based scan results
- 📄 JSON output
- 🚦 CI/CD exit codes
- 🤖 GitHub Actions integration

---

## 🔍 What Lumen Checks

### Project

Lumen detects basic project configuration such as:

- `package.json`
- Git repository
- TypeScript configuration

Example:

```text
✓ package.json detected
✓ Git repository detected
✓ TypeScript detected