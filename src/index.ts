import { Command } from "commander";

import {
  scanCommand
} from "./commands/scan.command.js";

const program =
  new Command();

program
  .name("lumen")
  .description(
    "Illuminate your code."
  )
  .version("0.1.0");

program
  .command("scan")
  .description(
    "Analyze your project"
  )
  .argument(
    "[path]",
    "Project path",
    "."
  )
  .option(
    "--json",
    "Output scan results as JSON"
  )
  .action(
    async (
      path,
      options
    ) => {
      await scanCommand(
        path,
        options
      );
    }
  );

program.parse();