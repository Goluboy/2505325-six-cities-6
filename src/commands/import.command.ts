import { CommandInterface } from '../commands/command.interface.js';
import { TSVFileReader } from '../shared/libs/file-reader/tsv-file-reader.js';
import chalk from 'chalk';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import mongoose from 'mongoose';
import { UserEntity, OfferEntity } from '../main/database/models/index.js';
import { logger } from '../main/app/logger.js';

export class ImportCommand implements CommandInterface {
  public getName(): string {
    return '--import';
  }

  private parseArgs(parameters: string[]): { filename?: string; dbUri?: string } {
    const result: { filename?: string; dbUri?: string } = {};
    
    for (let i = 0; i < parameters.length; i++) {
      const param = parameters[i];
      
      if (param === '--db' || param === '--database') {
        result.dbUri = parameters[++i];
      } else if (!param.startsWith('--')) {
        result.filename = param;
      }
    }
    
    return result;
  }

  public async execute(...parameters: string[]): Promise<void> {
    const { filename, dbUri } = this.parseArgs(parameters);

    if (!filename) {
      console.error(chalk.red('Please provide input file path.'));
      return;
    }

    if (!dbUri) {
      console.error(chalk.red('Please provide database connection URI using --db or --database flag.'));
      return;
    }

    try {
      // Connect to database
      logger.info(`Connecting to database: ${dbUri}`);
      await mongoose.connect(dbUri);
      logger.info('Successfully connected to database');

      const fileReader = new TSVFileReader(filename.trim());

      console.log(chalk.blue(`Starting import from: ${filename}`));

      let importedCount = 0;
      let errorCount = 0;
      const userCache = new Map<string, string>(); // email -> userId

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
          const offerData = fileReader.parseLine(line);
          
          // Find or create user
          let userId = userCache.get(offerData.author.email);
          
          if (!userId) {
            let user = await UserEntity.findOne({ email: offerData.author.email });
            
            if (!user) {
              user = await UserEntity.create({
                name: offerData.author.name,
                email: offerData.author.email,
                avatar: offerData.author.avatar,
                password: offerData.author.password,
                type: offerData.author.type
              });
              logger.info(`Created user: ${offerData.author.email}`);
            }
            
            userId = user._id.toString();
            userCache.set(offerData.author.email, userId);
          }

          // Create offer
          await OfferEntity.create({
            title: offerData.title,
            description: offerData.description,
            publishDate: offerData.publishDate,
            city: offerData.city.name,
            previewImage: offerData.previewImage,
            photos: offerData.photos,
            isPremium: offerData.isPremium,
            isFavorite: offerData.isFavorite,
            rating: offerData.rating,
            type: offerData.type,
            rooms: offerData.rooms,
            guests: offerData.quests,
            price: offerData.price,
            amenities: offerData.amenities,
            author: userId,
            commentsCount: offerData.commentsCount,
            coordinates: offerData.coordinates
          });

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

      // Disconnect from database
      await mongoose.disconnect();
      logger.info('Disconnected from database');
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }

      console.error(chalk.red(`Can't import data from file: ${filename}`));
      console.error(chalk.redBright(`Details: ${err.message}`));
      
      // Ensure disconnection on error
      try {
        await mongoose.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }
  }
}
