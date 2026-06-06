import { Controller } from './controller.abstract.js';
import { inject, injectable } from 'inversify';
import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { CommentService, OfferService } from '../../database/index.js';
import { Logger } from 'pino';
import { CreateCommentDto } from '../../../shared/dto/create-comment.dto.js';
import { ValidateObjectIdMiddleware, CheckEntityExistsMiddleware, AuthGuardMiddleware, ValidateDtoMiddleware } from '../middlewares/index.js';
import { JwtTokenService } from '../../../shared/libs/jwt-token/index.js';
import { Types } from 'mongoose';

@injectable()
export class CommentController extends Controller{
  constructor(
        @inject('Logger') private readonly logger: Logger,
        @inject(CommentService) private readonly commentService: CommentService,
        @inject(OfferService) private readonly offerService: OfferService,
        @inject(JwtTokenService) private readonly jwtTokenService: JwtTokenService
  ) {
    super();
    this.initRoutes();
  }

  initRoutes() {
    const validateObjectId = new ValidateObjectIdMiddleware('id').execute;
    const checkOfferExists = new CheckEntityExistsMiddleware(this.offerService, 'id').execute;
    const validateCreateCommentDto = new ValidateDtoMiddleware(CreateCommentDto).execute;
    const authGuard = new AuthGuardMiddleware(this.jwtTokenService).execute;

    this.addRoute({
      path: '/offers/:id/comments',
      method: 'get',
      handler: expressAsyncHandler(this.index.bind(this)),
      middlewares: [validateObjectId, checkOfferExists]
    });

    this.addRoute({
      path: '/offers/:id/comments',
      method: 'post',
      handler: expressAsyncHandler(this.create.bind(this)),
      middlewares: [authGuard, validateObjectId, validateCreateCommentDto, checkOfferExists]
    });
  }

  private async create(req: Request, res: Response){
    const offerId = req.params.id as string;
    const author = req.user?.userId as string;
    const dto = this.transformToDto(CreateCommentDto, req.body);

    dto.offer = new Types.ObjectId(offerId);
    dto.author = new Types.ObjectId(author);
    dto.publishDate = new Date();

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
