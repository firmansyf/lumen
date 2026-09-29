export type LumenFailSeverity =
  | "error"
  | "warning"
  | "none";

export interface LumenSecurityConfig {
  failOn?: LumenFailSeverity;
}

export interface LumenConfig {
  ignore?: string[];

  security?: LumenSecurityConfig;
}