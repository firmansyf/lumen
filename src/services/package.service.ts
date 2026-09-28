import fs from "node:fs";
import path from "node:path";

export function getInstalledVersion(
  projectPath: string,
  packageName: string
): string | null {
  const packageJsonPath = path.join(
    projectPath,
    "node_modules",
    packageName,
    "package.json"
  );

  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf-8")
    ) as {
      version?: string;
    };

    return packageJson.version ?? null;
  } catch {
    return null;
  }
}