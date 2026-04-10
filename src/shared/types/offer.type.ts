import { City } from './city.type.js';
import { HousingType } from './housing-type.type.js';
import { Amenity } from './amenity.type.js';

export type Offer = {
  title: string;
  description: string;
  postDate: Date;
  city: City;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  housingType: HousingType;
  rooms: number;
  guests: number;
  price: number;
  amenities: Amenity[];
  authorEmail: string;
  latitude: number;
  longitude: number;
}
