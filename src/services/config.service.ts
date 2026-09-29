import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type {
  LumenConfig
} from "../types/config.js";

const CONFIG_FILES = [
  "lumen.config.ts",
  "lumen.config.mts",
  "lumen.config.js",
  "lumen.config.mjs"
];

const DEFAULT_CONFIG: LumenConfig = {
  ignore: [],

  security: {
    failOn: "error"
  }
};

export async function loadLumenConfig(
  projectPath: string
): Promise<LumenConfig> {
  const configPath =
    findConfigFile(projectPath);

  if (!configPath) {
    return {
      ...DEFAULT_CONFIG,
      security: {
        ...DEFAULT_CONFIG.security
      }
    };
  }

  try {
    const module =
      await import(
        pathToFileURL(
          configPath
        ).href
      );

    const userConfig =
      module.default ?? module;

    return normalizeConfig(
      userConfig
    );
  } catch (error) {
    console.warn(
      `Warning: Unable to load ${path.basename(configPath)}.`
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

function findConfigFile(
  projectPath: string
): string | null {
  for (
    const fileName of CONFIG_FILES
  ) {
    const configPath =
      path.join(
        projectPath,
        fileName
      );

    if (
      fs.existsSync(configPath)
    ) {
      return configPath;
    }
  }

  return null;
}

function normalizeConfig(
  config: unknown
): LumenConfig {
  if (
    !config ||
    typeof config !== "object"
  ) {
    return {
      ...DEFAULT_CONFIG,
      security: {
        ...DEFAULT_CONFIG.security
      }
    };
  }

  const raw =
    config as Record<
      string,
      unknown
    >;

  const rawSecurity =
    raw.security;

  let failOn =
    DEFAULT_CONFIG.security?.failOn;

  if (
    rawSecurity &&
    typeof rawSecurity === "object"
  ) {
    const security =
      rawSecurity as Record<
        string,
        unknown
      >;

    if (
      security.failOn === "error" ||
      security.failOn === "warning" ||
      security.failOn === "none"
    ) {
      failOn =
        security.failOn;
    }
  }

  const ignore =
    Array.isArray(
      raw.ignore
    )
      ? raw.ignore.filter(
          (
            value
          ): value is string =>
            typeof value ===
            "string"
        )
      : [];

  return {
    ignore,

    security: {
      failOn
    }
  };
}