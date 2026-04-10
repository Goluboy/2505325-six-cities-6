#!/usr/bin/env node

import { CLIApplication } from './cli/cli-application.js';
import { HelpCommand, VersionCommand, ImportCommand } from './commands/index.js';

function bootstrap() {
  const cliApplication = new CLIApplication();
  cliApplication.registerCommands([
    new HelpCommand(),
    new VersionCommand(),
    new ImportCommand(),
  ]);

  cliApplication.processCommand(process.argv);
}

bootstrap();
