import fs from "node:fs";

export function parseEnvironmentVariables(
  content: string
): Set<string> {
  const variables = new Set<string>();

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmedLine =
      line.trim();

    if (
      !trimmedLine ||
      trimmedLine.startsWith("#")
    ) {
      continue;
    }

    const match =
      trimmedLine.match(
        /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/
      );

    if (!match) {
      continue;
    }

    variables.add(match[1]);
  }

  return variables;
}

export function readEnvironmentFile(
  filePath: string
): Set<string> {
  if (!fs.existsSync(filePath)) {
    return new Set<string>();
  }

  try {
    const content =
      fs.readFileSync(
        filePath,
        "utf-8"
      );

    return parseEnvironmentVariables(
      content
    );
  } catch {
    return new Set<string>();
  }
}

export function extractEnvironmentVariables(
  content: string
): Set<string> {
  const variables = new Set<string>();

  /*
   * Node.js / React / React Native
   *
   * process.env.API_URL
   */
  const processEnvRegex =
    /\bprocess\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;

  let match: RegExpExecArray | null;

  while (
    (match =
      processEnvRegex.exec(content)) !== null
  ) {
    variables.add(match[1]);
  }

  /*
   * Vite / modern frontend tooling
   *
   * import.meta.env.VITE_API_URL
   */
  const importMetaEnvRegex =
    /\bimport\.meta\.env\.([A-Za-z_][A-Za-z0-9_]*)/g;

  while (
    (match =
      importMetaEnvRegex.exec(content)) !== null
  ) {
    variables.add(match[1]);
  }

  return variables;
}