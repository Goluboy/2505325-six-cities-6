import { CommandInterface } from '../commands/command.interface.js';
import chalk from 'chalk';


export class HelpCommand implements CommandInterface {
  public getName(): string {
    return '--help';
  }

  public async execute(): Promise<void> {
    console.info(chalk.green(`
        Программа для подготовки данных для REST API сервера.
        Пример:
            cli.js --<command> [--arguments]
        Команды:
            --version:                   # выводит номер версии
            --help:                      # печатает этот текст
            --import <path>:             # импортирует данные из TSV
            --generate <n> <path> <url>  # генерирует произвольное количество тестовых данных
    `));
  }
}
