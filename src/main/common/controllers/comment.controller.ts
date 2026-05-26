import { Controller } from './controller.abstract.js';
import { inject, injectable } from 'inversify';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { CommentService, OfferService } from '../../database/index.js';
import { Logger } from 'pino';
import { CreateCommentDto } from '../../../shared/dto/create-comment.dto.js';
import { ValidateObjectIdMiddleware, CheckEntityExistsMiddleware } from '../middlewares/index.js';

@injectable()
export class CommentController extends Controller{
  constructor(
        @inject('Logger') private readonly logger: Logger,
        @inject(CommentService) private readonly commentService: CommentService,
        @inject(OfferService) private readonly offerService: OfferService
  ) {
    super();
    this.initRoutes();
  }

  initRoutes() {
    const validateObjectId = new ValidateObjectIdMiddleware('id').execute;
    const checkOfferExists = new CheckEntityExistsMiddleware(this.offerService, 'id').execute;

    this.addRoute({
      path: '/offers/:id/comment',
      method: 'get',
      handler: expressAsyncHandler(this.index.bind(this)),
      middlewares: [validateObjectId, checkOfferExists]
    });

    this.addRoute({
      path: '/offers/:id/comment',
      method: 'post',
      handler: expressAsyncHandler(this.create.bind(this)),
      middlewares: [validateObjectId, checkOfferExists]
    });
  }

  private async create(req: Request, res: Response){
    const offerId = req.params.id as string;
    const dto = this.transformToDto(CreateCommentDto, req.body);

    dto.offer = offerId;

    this.logger.info('New comment for offer:', offerId);

    const comment = await this.commentService.create(dto);

    await this.offerService.incrementCommentCount(offerId);
    await this.offerService.calculateRating(offerId);

    this.created(res, comment, 'Comment created successfully');
  }

  private async index(req: Request, res: Response){
    const offerId = req.params.id as string;
    this.logger.info('Getting comments for offer:', offerId);

    const comment = await this.commentService.findByOfferId(offerId);
    this.ok(res, comment, 'Comment found successfully');
  }
}
