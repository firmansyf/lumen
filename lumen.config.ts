import type {
  LumenConfig
} from "./src/types/config.js";

const config: LumenConfig = {
  ignore: [
    "src/tests/",
    "fixtures/"
  ],

  security: {
    failOn: "error"
  }
};

export default config;