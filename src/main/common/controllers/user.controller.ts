import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Logger } from 'pino';
import { UserService } from '../../database/index.js';
import { AuthService } from '../../database/services/auth.service.js';
import { JwtTokenService } from '../../../shared/libs/jwt-token/index.js';
import { CreateUserDto, LoginDto } from '../../../shared/dto/index.js';
import { Controller } from './controller.abstract.js';
import { ValidateDtoMiddleware, UploadMiddleware, AuthGuardMiddleware } from '../../common/middlewares/index.js';

@injectable()
export class UserController extends Controller {
  constructor(
    @inject('Logger') private readonly logger: Logger,
    @inject(UserService) private readonly userService: UserService,
    @inject(AuthService) private readonly authService: AuthService,
    @inject(JwtTokenService) private readonly jwtTokenService: JwtTokenService
  ) {
    super();
    this.initRoutes();
  }

  private initRoutes(): void {
    const validateCreateUserDto = new ValidateDtoMiddleware(CreateUserDto).execute;
    const validateLoginDto = new ValidateDtoMiddleware(LoginDto).execute;
    const uploadFile = new UploadMiddleware('avatar').execute;
    const authGuard = new AuthGuardMiddleware(this.jwtTokenService).execute;

    this.addRoute({
      path: '/users',
      method: 'post',
      handler: asyncHandler(this.register.bind(this)),
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
      middlewares: [authGuard],
    });

    this.addRoute({
      path: '/users/status',
      method: 'get',
      handler: asyncHandler(this.checkStatus.bind(this)),
      middlewares: [authGuard],
    });

    this.addRoute({
      path: '/users/avatar',
      method: 'post',
      handler: asyncHandler(this.uploadAvatar.bind(this)),
      middlewares: [authGuard, uploadFile],
    });
  }

  private async register(req: Request, res: Response): Promise<void> {
    this.logger.info('Registering new user with email:', req.body.email);

    try {
      const user = await this.authService.register(req.body);
      this.created(res, user, 'User registered successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        this.conflict('User with this email already exists');
      }
      throw error;
    }
  }

  private async login(req: Request, res: Response): Promise<void> {
    this.logger.info('User login attempt with email:', req.body.email);

    try {
      const { token, userId } = await this.authService.login(req.body);
      const user = await this.userService.findById(userId);
      
      this.ok(res, { user, token }, 'Login successful');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        this.unauthorized('Invalid email or password');
      }
      throw error;
    }
  }

  private async logout(req: Request, res: Response): Promise<void> {
    this.logger.info('User logout');
    await this.authService.logout('');
    this.ok(res, null, 'Logout successful');
  }

  private async checkStatus(req: Request, res: Response): Promise<void> {
    this.logger.info('Checking user status');
    const user = (req as any).user;
    
    if (!user) {
      this.unauthorized('User not authenticated');
    }

    const userData = await this.userService.findById(user.userId);
    this.ok(res, userData, 'User status checked');
  }

  private async uploadAvatar(req: Request, res: Response): Promise<void> {
    const user = (req as any).user;

    if (!user) {
      this.unauthorized('User not authenticated');
    }

    if (!req.file) {
      this.badRequest('No file provided');
      return;
    }

    const avatarPath = `/uploads/${req.file.filename}`;
    const updatedUser = await this.userService.updateAvatar(user.userId, avatarPath);

    this.ok(res, updatedUser, 'Avatar uploaded successfully');
  }
}