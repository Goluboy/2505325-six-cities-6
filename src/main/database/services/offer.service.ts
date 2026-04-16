import { injectable } from 'inversify';
import { OfferModel, OfferEntity } from '../models/offer.model.js';
import { OfferServiceInterface } from './database-service.interface.js';

@injectable()
export class OfferService implements OfferServiceInterface {
  public async findById(id: string): Promise<OfferModel | null> {
    return OfferEntity.findById(id).exec();
  }

  public async create(offerData: Partial<OfferModel>): Promise<OfferModel> {
    const offer = new OfferEntity(offerData);
    return offer.save();
  }
}
