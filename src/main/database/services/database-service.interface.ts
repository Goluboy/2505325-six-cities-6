import type { UserModel } from '../models/user.model.js';
import type { OfferModel } from '../models/offer.model.js';
import type { CommentModel } from '../models/comment.model.js';
import type { Types } from 'mongoose';
import { CreateUserDto } from '../../../shared/dto/create-user.dto.js';
import { CreateOfferDto, UpdateOfferDto } from '../../../shared/dto/create-offer.dto.js';
import { CreateCommentDto } from '../../../shared/dto/create-comment.dto.js';

export interface DatabaseServiceInterface {
  connect(uri: string): Promise<void>;
  disconnect(): Promise<void>;
}

export interface UserServiceInterface {
  findById(id: string): Promise<UserModel | null>;
  findByEmail(email: string): Promise<UserModel | null>;
  create(dto: CreateUserDto): Promise<UserModel>;
  findOrCreate(userData: Partial<UserModel>): Promise<UserModel>;
  updateAvatar(id: string, avatarPath: string): Promise<UserModel | null>;
}

export interface OfferServiceInterface {
  findById(id: string): Promise<OfferModel | null>;
  findAll(limit?: number): Promise<OfferModel[]>;
  create(dto: CreateOfferDto): Promise<OfferModel>;
  updateById(id: string, dto: UpdateOfferDto): Promise<OfferModel | null>;
  deleteById(id: string): Promise<boolean>;
  findPremiumByCity(city: string, limit?: number): Promise<OfferModel[]>;
  findFavorites(userId: string): Promise<OfferModel[]>;
  addToFavorites(offerId: string, userId: string): Promise<OfferModel | null>;
  removeFromFavorites(offerId: string, userId: string): Promise<OfferModel | null>;
  incrementCommentCount(offerId: string): Promise<void>;
  calculateRating(offerId: string): Promise<void>;
}

export interface CommentServiceInterface {
  findByOfferId(offerId: string, limit?: number): Promise<CommentModel[]>;
  create(dto: CreateCommentDto): Promise<CommentModel>;
}
