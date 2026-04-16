import { CommandInterface } from '../commands/command.interface.js';
import {CommandParser} from './command-parser.js';


type CommandCollection = Record<string, CommandInterface>;

export class CLIApplication {
  private commands: CommandCollection = {};

  constructor(
    private readonly defaultCommand: string = '--help'
  ) {}

  public registerCommands(commandList: CommandInterface[]): void {
    commandList.forEach((command) => {
      if (Object.hasOwn(this.commands, command.getName())) {
        throw new Error(`Command ${command.getName()} is already registered`);
      }
      this.commands[command.getName()] = command;
    });
  }

  public getCommand(commandName: string): CommandInterface {
    return this.commands[commandName] ?? this.getDefaultCommand();
  }

  public getDefaultCommand(): CommandInterface | never {
    if (! this.commands[this.defaultCommand]) {
      throw new Error(`The default command (${this.defaultCommand}) is not registered.`);
    }
    return this.commands[this.defaultCommand];
  }

  public processCommand(argv: string[]): void {
    const parsedCommand = CommandParser.parse(argv);
    const commandKeys = Object.keys(parsedCommand);
    const [commandName] = commandKeys;
    const command = this.getCommand(commandName);
    
    // Collect all arguments including other flags
    const allArguments: string[] = [];
    for (const key of commandKeys) {
      if (key === commandName) {
        allArguments.push(...parsedCommand[key]);
      } else if (key.startsWith('--')) {
        allArguments.push(key, ...parsedCommand[key]);
      }
    }
    
    command.execute(...allArguments);
  }
}
