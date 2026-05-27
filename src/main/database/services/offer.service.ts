import { injectable } from 'inversify';
import { OfferModel, OfferEntity } from '../models/offer.model.js';
import { Types } from 'mongoose';
import { CommentEntity } from '../models/comment.model.js';
import { OfferServiceInterface } from './database-service.interface.js';
import { CreateOfferDto, UpdateOfferDto } from '../../../shared/dto/create-offer.dto.js';

@injectable()
export class OfferService implements OfferServiceInterface {
  public async findById(id: string): Promise<OfferModel | null> {
    return OfferEntity.findById(id).exec();
  }

  public async findAll(limit = 60): Promise<OfferModel[]> {
    return OfferEntity.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  public async create(dto: CreateOfferDto): Promise<OfferModel> {
    const offer = new OfferEntity(dto);
    return offer.save();
  }

  public async updateById(id: string, dto: UpdateOfferDto): Promise<OfferModel | null> {
    return OfferEntity.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  public async deleteById(id: string): Promise<boolean> {
    await CommentEntity.deleteMany({ offer: new Types.ObjectId(id) }).exec();

    const result = await OfferEntity.findByIdAndDelete(id).exec();
    return result !== null;
  }

  public async findPremiumByCity(city: string, limit = 3, userId?: string): Promise<OfferModel[]> {
    const offers = await OfferEntity.find({ city, isPremium: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    
    offers.forEach(offer => this.setFavoriteFlag(offer, userId));
    return offers;
  }

  public async findFavorites(userId: string): Promise<OfferModel[]> {
    if (!userId) {
      return [];
    }

    const objectId = new Types.ObjectId(userId);
    const offers = await OfferEntity.find({ favoriteUsers: objectId }).exec();
    
    offers.forEach(offer => this.setFavoriteFlag(offer, userId));
    return offers;
  }

  public async addToFavorites(offerId: string, userId: string): Promise<OfferModel | null> {
    if (!userId) {
      return null;
    }

    const offer = await OfferEntity.findByIdAndUpdate(
      offerId,
      {
        $addToSet: { favoriteUsers: new Types.ObjectId(userId) }
      },
      { new: true }
    ).exec();

    if (offer) {
      this.setFavoriteFlag(offer, userId);
    }
    return offer;
  }

  public async removeFromFavorites(offerId: string, userId: string): Promise<OfferModel | null> {
    if (!userId) {
      return null;
    }

    const offer = await OfferEntity.findByIdAndUpdate(
      offerId,
      {
        $pull: { favoriteUsers: new Types.ObjectId(userId) }
      },
      { new: true }
    ).exec();

    if (offer) {
      this.setFavoriteFlag(offer, userId);
    }
    return offer;
  }

  public async incrementCommentCount(offerId: string): Promise<void> {
    await OfferEntity.findByIdAndUpdate(
      offerId,
      { $inc: { commentsCount: 1 } }
    ).exec();
  }

  public async calculateRating(offerId: string): Promise<void> {
    const comments = await CommentEntity.find({ offer: new Types.ObjectId(offerId) }).exec();

    if (comments.length === 0) {
      await OfferEntity.findByIdAndUpdate(offerId, { rating: 0 }).exec();
      return;
    }

    const totalRating = comments.reduce((sum: number, comment: { rating: number }) => sum + comment.rating, 0);
    const averageRating = Number((totalRating / comments.length).toFixed(1));

    await OfferEntity.findByIdAndUpdate(offerId, { rating: averageRating }).exec();
  }

  private setFavoriteFlag(offer: OfferModel, userId?: string): void {
    if (!userId) {
      offer.isFavorite = false;
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    offer.isFavorite = (offer.favoriteUsers || []).some(
      id => id.toString() === userObjectId.toString()
    );
  }
}
