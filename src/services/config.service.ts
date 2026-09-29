import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type {
  LumenConfig,
  LumenFailSeverity
} from "../types/config.js";

const CONFIG_FILES = [
  "lumen.config.ts",
  "lumen.config.mts",
  "lumen.config.js",
  "lumen.config.mjs"
];

const DEFAULT_CONFIG: Required<LumenConfig> = {
  ignore: [],

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

export async function loadLumenConfig(
  projectPath: string
): Promise<LumenConfig> {
  const configPath =
    findConfigFile(projectPath);

  if (!configPath) {
    return createDefaultConfig();
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

    return createDefaultConfig();
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

function createDefaultConfig(): LumenConfig {
  return {
    ignore: [
      ...DEFAULT_CONFIG.ignore
    ],

    failOn:
      DEFAULT_CONFIG.failOn,

    dependency: {
      ...DEFAULT_CONFIG.dependency
    },

    security: {
      ...DEFAULT_CONFIG.security
    },

    environment: {
      ...DEFAULT_CONFIG.environment
    }
  };
}

function normalizeConfig(
  config: unknown
): LumenConfig {
  if (
    !config ||
    typeof config !== "object"
  ) {
    return createDefaultConfig();
  }

  const raw =
    config as Record<
      string,
      unknown
    >;

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
      : [
          ...DEFAULT_CONFIG.ignore
        ];

  const failOn =
    normalizeFailOn(
      raw.failOn
    );

  const dependency =
    normalizeDependencyConfig(
      raw.dependency
    );

  const security =
    normalizeSecurityConfig(
      raw.security
    );

  const environment =
    normalizeEnvironmentConfig(
      raw.environment
    );

  return {
    ignore,

    failOn,

    dependency,

    security,

    environment
  };
}

function normalizeFailOn(
  value: unknown
): LumenFailSeverity {
  if (
    value === "error" ||
    value === "warning" ||
    value === "none"
  ) {
    return value;
  }

  return DEFAULT_CONFIG.failOn;
}

function normalizeDependencyConfig(
  value: unknown
): LumenConfig["dependency"] {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {
      ...DEFAULT_CONFIG.dependency
    };
  }

  const raw =
    value as Record<
      string,
      unknown
    >;

  return {
    checkUpdates:
      typeof raw.checkUpdates ===
      "boolean"
        ? raw.checkUpdates
        : DEFAULT_CONFIG
            .dependency
            .checkUpdates
  };
}

function normalizeSecurityConfig(
  value: unknown
): LumenConfig["security"] {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {
      ...DEFAULT_CONFIG.security
    };
  }

  const raw =
    value as Record<
      string,
      unknown
    >;

  return {
    enabled:
      typeof raw.enabled ===
      "boolean"
        ? raw.enabled
        : DEFAULT_CONFIG
            .security
            .enabled
  };
}

function normalizeEnvironmentConfig(
  value: unknown
): LumenConfig["environment"] {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {
      ...DEFAULT_CONFIG.environment
    };
  }

  const raw =
    value as Record<
      string,
      unknown
    >;

  return {
    enabled:
      typeof raw.enabled ===
      "boolean"
        ? raw.enabled
        : DEFAULT_CONFIG
            .environment
            .enabled
  };
}