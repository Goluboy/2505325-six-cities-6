import { HouseType, AmenitiesType, UserType } from '../../shared/index.js';


export interface MockDataResponse {
  titles: string[];
  descriptions: string[];
  cities: Array<{ name: string; latitude: number; longitude: number }>;
  previewImages: string[];
  photoSets: string[][];
  houseTypes: HouseType[];
  amenities: AmenitiesType[];
  userNames: string[];
  userEmails: string[];
  userAvatars: string[];
  userPasswords: string[];
  userTypes: UserType[];
}
