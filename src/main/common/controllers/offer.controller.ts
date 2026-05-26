import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Logger } from 'pino';
import { OfferService } from '../../database/index.js';
import { CreateOfferDto, UpdateOfferDto } from '../../../shared/dto/create-offer.dto.js';
import { Controller } from './controller.abstract.js';
import { ValidateObjectIdMiddleware, ValidateDtoMiddleware, CheckEntityExistsMiddleware } from '../../common/middlewares/index.js';

@injectable()
export class OfferController extends Controller {
  constructor(
    @inject('Logger') private readonly logger: Logger,
    @inject(OfferService) private readonly offerService: OfferService
  ) {
    super();
    this.initRoutes();
  }

  private initRoutes(): void {
    const validateObjectId = new ValidateObjectIdMiddleware('id').execute;
    const validateCreateOfferDto = new ValidateDtoMiddleware(CreateOfferDto).execute;
    const validateUpdateOfferDto = new ValidateDtoMiddleware(UpdateOfferDto).execute;
    const checkOfferExists = new CheckEntityExistsMiddleware(this.offerService, 'id').execute;

    this.addRoute({
      path: '/offers',
      method: 'get',
      handler: asyncHandler(this.findAll.bind(this)),
    });

    this.addRoute({
      path: '/offers',
      method: 'post',
      handler: asyncHandler(this.create.bind(this)),
      middlewares: [validateCreateOfferDto],
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'get',
      handler: asyncHandler(this.findById.bind(this)),
      middlewares: [validateObjectId, checkOfferExists],
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'patch',
      handler: asyncHandler(this.update.bind(this)),
      middlewares: [validateObjectId, validateUpdateOfferDto, checkOfferExists],
    });

    this.addRoute({
      path: '/offers/:id',
      method: 'delete',
      handler: asyncHandler(this.delete.bind(this)),
      middlewares: [validateObjectId, checkOfferExists],
    });

    this.addRoute({
      path: '/offers/premium/:city',
      method: 'get',
      handler: asyncHandler(this.findPremiumByCity.bind(this)),
    });

    this.addRoute({
      path: '/offers/favorites',
      method: 'get',
      handler: asyncHandler(this.findFavorites.bind(this)),
    });

    this.addRoute({
      path: '/offers/favorites/:id',
      method: 'post',
      handler: asyncHandler(this.addToFavorites.bind(this)),
      middlewares: [validateObjectId, checkOfferExists],
    });

    this.addRoute({
      path: '/offers/favorites/:id',
      method: 'delete',
      handler: asyncHandler(this.removeFromFavorites.bind(this)),
      middlewares: [validateObjectId, checkOfferExists],
    });
  }

  private async findAll(req: Request, res: Response): Promise<void> {
    this.logger.info('Getting all offers');
    const offers = await this.offerService.findAll();
    this.ok(res, offers, 'Offers retrieved successfully');
  }

  private async create(req: Request, res: Response): Promise<void> {
    this.logger.info('Creating new offer with title:', req.body.title);

    const offer = await this.offerService.create(req.body);
    this.created(res, offer, 'Offer created successfully');
  }

  private async findById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    this.logger.info('Getting offer by id:', id);

    const offer = await this.offerService.findById(id);

    this.ok(res, offer, 'Offer retrieved successfully');
  }

  private async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    this.logger.info('Updating offer with id:', id);

    const offer = await this.offerService.updateById(id, req.body);

    this.ok(res, offer, 'Offer updated successfully');
  }

  private async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    this.logger.info('Deleting offer with id:', id);

    await this.offerService.deleteById(id);

    this.noContent(res);
  }

  private async findPremiumByCity(req: Request, res: Response): Promise<void> {
    const city = req.params.city as string;
    this.logger.info('Getting premium offers for city:', city);

    const offers = await this.offerService.findPremiumByCity(city);
    this.ok(res, offers, 'Premium offers retrieved successfully');
  }

  private async findFavorites(req: Request, res: Response): Promise<void> {
    const userId = (req.body.user)?._id || 'default-user-id';
    this.logger.info('Getting favorite offers for user:', userId);

    const offers = await this.offerService.findFavorites(userId);
    this.ok(res, offers, 'Favorite offers retrieved successfully');
  }

  private async addToFavorites(req: Request, res: Response): Promise<void> {
    const offerId = req.params.id as string;
    const userId = (req.body.user)?._id || 'default-user-id';
    this.logger.info('Adding offer to favorites:', offerId, 'for user:', userId);

    const offer = await this.offerService.addToFavorites(offerId, userId);

    this.ok(res, offer, 'Offer added to favorites');
  }

  private async removeFromFavorites(req: Request, res: Response): Promise<void> {
    const offerId = req.params.id as string;
    const userId = (req.body.user)?._id || 'default-user-id';
    this.logger.info('Removing offer from favorites:', offerId, 'for user:', userId);

    const offer = await this.offerService.removeFromFavorites(offerId, userId);

    this.ok(res, offer, 'Offer removed from favorites');
  }
}
