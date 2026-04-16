import type { UserModel } from '../models/user.model.js';
import type { OfferModel } from '../models/offer.model.js';

export interface DatabaseServiceInterface {
  connect(uri: string): Promise<void>;
  disconnect(): Promise<void>;
}

export interface UserServiceInterface {
  findById(id: string): Promise<UserModel | null>;
  findByEmail(email: string): Promise<UserModel | null>;
  create(userData: Partial<UserModel>): Promise<UserModel>;
}

export interface OfferServiceInterface {
  findById(id: string): Promise<OfferModel | null>;
  create(offerData: Partial<OfferModel>): Promise<OfferModel>;
}
