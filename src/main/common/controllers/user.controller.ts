import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Logger } from 'pino';
import { UserService } from '../../database/index.js';
import { CreateUserDto, LoginDto } from '../../../shared/dto/index.js';
import { Controller } from './controller.abstract.js';
import { ValidateDtoMiddleware, UploadMiddleware } from '../../common/middlewares/index.js';

@injectable()
export class UserController extends Controller {
  constructor(
    @inject('Logger') private readonly logger: Logger,
    @inject(UserService) private readonly userService: UserService
  ) {
    super();
    this.initRoutes();
  }

  private initRoutes(): void {
    const validateCreateUserDto = new ValidateDtoMiddleware(CreateUserDto).execute;
    const validateLoginDto = new ValidateDtoMiddleware(LoginDto).execute;
    const uploadFile = new UploadMiddleware('avatar').execute;

    this.addRoute({
      path: '/users',
      method: 'post',
      handler: asyncHandler(this.create.bind(this)),
      middlewares: [validateCreateUserDto],
    });

    this.addRoute({
      path: '/login',
      method: 'post',
      handler: asyncHandler(this.login.bind(this)),
      middlewares: [validateLoginDto],
    });

    this.addRoute({
      path: '/logout',
      method: 'post',
      handler: asyncHandler(this.logout.bind(this)),
    });

    this.addRoute({
      path: '/users/status',
      method: 'get',
      handler: asyncHandler(this.checkStatus.bind(this)),
    });

    this.addRoute({
      path: '/users/avatar',
      method: 'post',
      handler: asyncHandler(this.uploadAvatar.bind(this)),
      middlewares: [uploadFile],
    });
  }

  private async create(req: Request, res: Response): Promise<void> {
    this.logger.info('Creating new user with email:', req.body.email);

    const user = await this.userService.create(req.body);
    this.created(res, user, 'User created successfully');
  }

  private async login(req: Request, res: Response): Promise<void> {
    this.logger.info('User login attempt with email:', req.body.email);

    const user = await this.userService.findByEmail(req.body.email);
    if (!user) {
      this.notFound('User not found');
    }

    // TODO: Add password verification and token generation
    this.ok(res, user, 'Login successful');
  }

  private async logout(req: Request, res: Response): Promise<void> {
    this.logger.info('User logout');
    this.ok(res, null, 'Logout successful');
  }

  private async checkStatus(req: Request, res: Response): Promise<void> {
    this.logger.info('Checking user status');
    this.ok(res, null, 'User status checked');
  }

  private async uploadAvatar(req: Request, res: Response): Promise<void> {
    const userId = req.body.id;

    if (!req.file) {
      this.badRequest();
      return;
    }

    const avatarPath = `/uploads/${req.file.filename}`;
    const updatedUser = await this.userService.updateAvatar(userId, avatarPath);

    this.ok(res, updatedUser, 'Avatar uploaded successfully');
  }
}
