export type LumenFailSeverity =
  | "error"
  | "warning"
  | "none";

export interface LumenDependencyConfig {
  checkUpdates?: boolean;
}

export interface LumenSecurityConfig {
  enabled?: boolean;
}

export interface LumenEnvironmentConfig {
  enabled?: boolean;
}

export interface LumenConfig {
  ignore?: string[];

  failOn?: LumenFailSeverity;

  dependency?: LumenDependencyConfig;

  security?: LumenSecurityConfig;

  environment?: LumenEnvironmentConfig;
}