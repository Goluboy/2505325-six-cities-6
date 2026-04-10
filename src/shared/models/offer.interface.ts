import { UserInterface } from './user.interface.js';
import { CityInterface } from './city.interface.js';
import { HouseType } from './house.type.js';
import { AmenitiesType } from './amentities.type.js';

export interface CoordinatesInterface {
  latitude: number;
  longitude: number;
}

export interface OfferInterface {
  title: string;
  description: string;
  publishDate: Date;
  city: CityInterface;
  previewImage: string;
  photos: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: HouseType;
  rooms: number;
  quests: number;
  price: number;
  amenities: AmenitiesType[];
  author: UserInterface;
  commentsCount: number;
  coordinates: CoordinatesInterface;
}
