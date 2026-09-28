
import { Command } from "commander";

import { scanCommand } from "./commands/scan.command.js";

const program = new Command();

program
  .name("lumen")
  .description("Illuminate your code.")
  .version("0.1.0");

program
  .command("scan")
  .description("Analyze your project")
  .argument("[path]", "Project path", ".")
  .action(scanCommand);

program.parse();