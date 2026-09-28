import path from "node:path";

import pc from "picocolors";

import {
  analyzeProject,
  analyzeDependencies
} from "../analyzers/index.js";

import {
  printIssue,
  printSummary
} from "../formatters/terminal.formatter.js";

export async function scanCommand(
  projectPath = "."
) {
  const absolutePath = path.resolve(projectPath);

  console.log();
  console.log(pc.bold("Lumen"));
  console.log(pc.dim("Illuminate your code."));
  console.log();

  console.log(
    pc.dim(`Scanning: ${absolutePath}`)
  );

  console.log();

  const projectIssues =
    analyzeProject(absolutePath);

  const dependencyIssues =
    await analyzeDependencies(absolutePath);

  const issues = [
    ...projectIssues,
    ...dependencyIssues
  ];

  for (const issue of issues) {
    printIssue(issue);
  }

  printSummary(issues);
}