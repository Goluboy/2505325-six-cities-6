import { FileReader } from './models/index.js';
import { readFileSync } from 'node:fs';
import chalk from 'chalk';
import {
  OfferInterface,
  CityInterface,
  CoordinatesInterface,
  UserInterface, findHouseType, findUserType, findAmenityType
} from '../../models/index.js';

export class TSVFileReader implements FileReader {
  private rawData = '';

  constructor(
    private readonly filename: string
  ) { }

  public read(): void {
    try {
      this.rawData = readFileSync(this.filename, { encoding: 'utf-8' });
      console.log(chalk.green(`Success with reading: ${this.filename}`));
    } catch (err) {
      console.error(chalk.red(`Failed to read file: ${this.filename}`));
      throw err;
    }
  }

  public toArray(): OfferInterface[] {
    if (!this.rawData) {
      throw new Error(chalk.red('File was not read'));
    }

    const lines = this.rawData
      .split('\n')
      .filter((row) => row.trim().length > 0)
      .slice(1);

    console.log(chalk.blue(`Records found: ${lines.length}`));

    return lines.map((line) => this.parseLine(line));
  }

  public parseLine(line: string): OfferInterface {
    const [
      title,
      description,
      publishedDate,
      city,
      previewImage,
      photos,
      isPremiumRaw,
      isFavoriteRaw,
      ratingRaw,
      typeRaw,
      roomsRaw,
      guestsRaw,
      priceRaw,
      amenitiesRaw,
      authorName,
      authorEmail,
      authorAvatar,
      authorPassword,
      authorTypeRaw,
      commentsCountRaw,
      coordinatesRaw,
    ] = line.split('\t');

    const houseType = findHouseType(typeRaw?.trim());
    if (!houseType) {
      throw new Error(`Invalid HouseType: "${typeRaw}"`);
    }

    const userType = findUserType(authorTypeRaw?.trim());
    if (!userType) {
      throw new Error(`Invalid UserType: "${authorTypeRaw}"`);
    }

    const amenities = amenitiesRaw
      ?.split(';')
      .map((amenity) => {
        const found = findAmenityType(amenity.trim());
        if (!found) {
          throw new Error(`Invalid AmenitiesType: "${amenity}"`);
        }
        return found;
      });

    const [latitude, longitude] = coordinatesRaw
      .split(',')
      .map((coord) => Number.parseFloat(coord));

    const author: UserInterface = {
      name: authorName?.trim(),
      email: authorEmail?.trim(),
      avatar: authorAvatar?.trim() || undefined,
      password: authorPassword?.trim(),
      type: userType,
    };

    return {
      title: title?.trim(),
      description: description?.trim(),
      publishDate: new Date(publishedDate),
      city: {
        name: city?.trim(),
        latitude,
        longitude,
      } satisfies CityInterface,
      previewImage: previewImage?.trim(),
      photos: photos?.split(';').map((photo) => photo.trim()),
      isPremium: isPremiumRaw?.trim().toLowerCase() === 'true',
      isFavorite: isFavoriteRaw?.trim().toLowerCase() === 'true',
      rating: Number.parseFloat(ratingRaw),
      type: houseType,
      rooms: Number.parseInt(roomsRaw, 10),
      quests: Number.parseInt(guestsRaw, 10),
      price: Number.parseInt(priceRaw, 10),
      amenities,
      author,
      commentsCount: Number.parseInt(commentsCountRaw, 10),
      coordinates: {
        latitude,
        longitude,
      } satisfies CoordinatesInterface,
    };
  }
}
