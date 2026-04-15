import { CommandInterface } from '../command.interface.js';
import chalk from 'chalk';
import { fetchMockData, OfferGenerator } from './offer-generator.js';
import { TSVFileWriter } from '../../shared/libs/index.js';

export class GenerateCommand implements CommandInterface {
  public getName(): string {
    return '--generate';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [countStr, filepath, url] = parameters;
    const count = Number.parseInt(countStr, 10);

    if (Number.isNaN(count) || count <= 0) {
      console.error(chalk.red('Invalid count. Please provide a positive number.'));
      return;
    }

    if (!filepath) {
      console.error(chalk.red('Please provide output file path.'));
      return;
    }

    if (!url) {
      console.error(chalk.red('Please provide JSON server URL.'));
      return;
    }

    try {
      console.log(chalk.blue(`Fetching mock data from ${url}...`));
      const mockData = await fetchMockData(url);

      console.log(chalk.blue(`Generating ${count} offers...`));
      const generator = new OfferGenerator(mockData);

      const writer = new TSVFileWriter(filepath.trim());

      const header = 'Title\tDescription\tPublishedDate\tCity\tPreviewImage\tPhotos\tPremium\tFavorite\tRating\tType\tRooms\tGuests\tPrice\tAmenities\tAuthorName\tAuthorEmail\tAuthorAvatar\tAuthorPassword\tAuthorType\tCommentsCount\tCoordinates\n';
      await writer.write(header);

      for (let i = 0; i < count; i++) {
        const offer = generator.generate();
        const line = this.formatOfferToTSV(offer);
        await writer.write(`${line}\n`);

        if ((i + 1) % 100 === 0) {
          console.log(chalk.green(`Generated ${i + 1}/${count} offers...`));
        }
      }

      writer.close();

      console.log(chalk.green(`Successfully generated ${count} offers to ${filepath}`));
    } catch (error) {
      console.error(chalk.red(`Failed to generate offers: ${(error as Error).message}`));
    }
  }

  private formatOfferToTSV(offer: ReturnType<OfferGenerator['generate']>): string {
    const amenitiesStr = offer.amenities.join(';');
    const photosStr = offer.photos.join(';');
    const coordinatesStr = `${offer.coordinates.latitude},${offer.coordinates.longitude}`;
    const publishDateStr = offer.publishDate.toISOString().split('T')[0];

    return [
      offer.title,
      offer.description,
      publishDateStr,
      offer.city.name,
      offer.previewImage,
      photosStr,
      offer.isPremium.toString(),
      offer.isFavorite.toString(),
      offer.rating.toString(),
      offer.type,
      offer.rooms.toString(),
      offer.quests.toString(),
      offer.price.toString(),
      amenitiesStr,
      offer.author.name,
      offer.author.email,
      offer.author.avatar ?? '',
      offer.author.password,
      offer.author.type,
      offer.commentsCount.toString(),
      coordinatesStr,
    ].join('\t');
  }
}
