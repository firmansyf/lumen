import type {
  LumenConfig
} from "./src/types/config.js";

const config: LumenConfig = {
  ignore: [
    "src/tests/",
    "fixtures/"
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

export default config;