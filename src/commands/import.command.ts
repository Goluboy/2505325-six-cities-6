import { CommandInterface } from '../commands/command.interface.js';
import { TSVFileReader } from '../shared/libs/file-reader/tsv-file-reader.js';
import chalk from 'chalk';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export class ImportCommand implements CommandInterface {
  public getName(): string {
    return '--import';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [filename] = parameters;

    if (!filename) {
      console.error(chalk.red('Please provide input file path.'));
      return;
    }

    try {
      const fileReader = new TSVFileReader(filename.trim());

      console.log(chalk.blue(`Starting import from: ${filename}`));

      let importedCount = 0;
      let errorCount = 0;

      const readStream = createReadStream(filename.trim(), { encoding: 'utf-8' });
      const readline = createInterface({
        input: readStream,
        crlfDelay: Infinity
      });

      let isHeader = true;

      for await (const line of readline) {
        if (isHeader) {
          isHeader = false;
          continue;
        }

        if (line.trim().length === 0) {
          continue;
        }

        try {
          fileReader.parseLine(line);
          importedCount++;

          if (importedCount % 1000 === 0) {
            console.log(chalk.green(`Imported ${importedCount} records...`));
          }
        } catch (parseError) {
          errorCount++;
          console.warn(chalk.yellow(`Failed to parse line ${importedCount + errorCount}: ${(parseError as Error).message}`));
        }
      }

      console.log(chalk.green('Import completed successfully!'));
      console.log(chalk.green(`Total records imported: ${importedCount}`));
      if (errorCount > 0) {
        console.log(chalk.yellow(`Errors encountered: ${errorCount}`));
      }
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }

      console.error(chalk.red(`Can't import data from file: ${filename}`));
      console.error(chalk.redBright(`Details: ${err.message}`));
    }
  }
}
