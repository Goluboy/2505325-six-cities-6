import { prop, getModelForClass, defaultClasses, modelOptions } from '@typegoose/typegoose';
import { HouseType } from '../../../shared/models/house.type.js';
import { AmenitiesType } from '../../../shared/models/amentities.type.js';
import { Types } from 'mongoose';
import { UserModel } from './user.model.js';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
@modelOptions({ options: { allowMixed: 3 } })
export class OfferModel extends defaultClasses.TimeStamps {
  @prop({ required: true, minlength: 10, maxlength: 100 })
  public title!: string;

  @prop({ required: true, minlength: 20, maxlength: 1024 })
  public description!: string;

  @prop({ required: true })
  public publishDate!: Date;

  @prop({ required: true })
  public city!: string;

  @prop({ required: true })
  public previewImage!: string;

  @prop({ required: true, type: [String], length: 6 })
  public photos!: string[];

  @prop({ required: true })
  public isPremium!: boolean;

  @prop({ required: true })
  public isFavorite!: boolean;

  @prop({ required: true, min: 1, max: 5 })
  public rating!: number;

  @prop({ required: true, type: () => [String], enum: ['apartment', 'house', 'room', 'hotel'] })
  public type!: HouseType;

  @prop({ required: true, min: 1, max: 8 })
  public rooms!: number;

  @prop({ required: true, min: 1, max: 10 })
  public guests!: number;

  @prop({ required: true, min: 100, max: 100000 })
  public price!: number;

  @prop({ required: true, type: () => [String], enum: ['Breakfast', 'Air conditioning', 'Laptop friendly workspace', 'Baby seat', 'Washer', 'Towels', 'Fridge'] })
  public amenities!: AmenitiesType[];

  @prop({ required: true, ref: () => UserModel })
  public author!: Types.ObjectId;

  @prop({ required: true, default: 0 })
  public commentsCount!: number;

  @prop({ required: true, _id: false, type: () => Object })
  public coordinates!: Coordinates;
}

export const OfferEntity = getModelForClass(OfferModel);
