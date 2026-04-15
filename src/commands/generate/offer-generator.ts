import got from 'got';
import { MockDataResponse } from './mock-data.type.js';
import { AmenitiesType, CityInterface, HouseType, OfferInterface, UserInterface, UserType } from '../../shared/index.js';
import { getRandomNumber, getRandomFloat, getRandomElement, getRandomElements, getRandomDate } from '../../shared/libs/index.js';


export class OfferGenerator {
  private mockData: MockDataResponse;

  constructor(mockData: MockDataResponse) {
    this.mockData = mockData;
  }

  public generate(): OfferInterface {
    const city = getRandomElement(this.mockData.cities);
    const houseType = getRandomElement(this.mockData.houseTypes);
    const userType = getRandomElement(this.mockData.userTypes);
    const amenities = getRandomElements(
      this.mockData.amenities,
      getRandomNumber(1, this.mockData.amenities.length)
    );

    const author: UserInterface = {
      name: getRandomElement(this.mockData.userNames),
      email: getRandomElement(this.mockData.userEmails),
      avatar: getRandomElement(this.mockData.userAvatars) || undefined,
      password: getRandomElement(this.mockData.userPasswords),
      type: userType,
    };

    const rating = getRandomFloat(1, 5, 1);
    const rooms = getRandomNumber(1, 8);
    const guests = getRandomNumber(1, 10);
    const price = getRandomNumber(100, 100000);
    const commentsCount = getRandomNumber(0, 50);

    return {
      title: getRandomElement(this.mockData.titles),
      description: getRandomElement(this.mockData.descriptions),
      publishDate: getRandomDate(),
      city: {
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
      } satisfies CityInterface,
      previewImage: getRandomElement(this.mockData.previewImages),
      photos: getRandomElement(this.mockData.photoSets),
      isPremium: Math.random() < 0.3,
      isFavorite: Math.random() < 0.5,
      rating,
      type: houseType,
      rooms,
      quests: guests,
      price,
      amenities,
      author,
      commentsCount,
      coordinates: {
        latitude: city.latitude + getRandomFloat(-0.01, 0.01, 6),
        longitude: city.longitude + getRandomFloat(-0.01, 0.01, 6),
      },
    };
  }
}

export async function fetchMockData(baseUrl: string): Promise<MockDataResponse> {
  try {
    const endpoints = [
      'titles',
      'descriptions',
      'cities',
      'previewImages',
      'photoSets',
      'houseTypes',
      'amenities',
      'userNames',
      'userEmails',
      'userAvatars',
      'userPasswords',
      'userTypes',
    ];

    const results = await Promise.all(
      endpoints.map((endpoint) => got.get(`${baseUrl}/${endpoint}`).json())
    );

    const mockData: MockDataResponse = {
      titles: results[0] as string[],
      descriptions: results[1] as string[],
      cities: results[2] as Array<{ name: string; latitude: number; longitude: number }>,
      previewImages: results[3] as string[],
      photoSets: results[4] as string[][],
      houseTypes: results[5] as HouseType[],
      amenities: results[6] as AmenitiesType[],
      userNames: results[7] as string[],
      userEmails: results[8] as string[],
      userAvatars: results[9] as string[],
      userPasswords: results[10] as string[],
      userTypes: results[11] as UserType[],
    };

    return mockData;
  } catch (error) {
    throw new Error(`Failed to fetch mock data from ${baseUrl}: ${(error as Error).message}`);
  }
}
