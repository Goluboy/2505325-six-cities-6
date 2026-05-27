import { injectable, inject } from 'inversify';
import * as crypto from 'node:crypto';
import { Logger } from 'pino';
import { UserModel, UserEntity } from '../models/user.model.js';
import { CreateUserDto } from '../../../shared/dto/create-user.dto.js';
import { LoginDto } from '../../../shared/dto/login.dto.js';
import { JwtTokenService } from '../../../shared/libs/jwt-token/index.js';

export interface AuthToken {
  token: string;
  userId: string;
}

@injectable()
export class AuthService {
  constructor(
    @inject('Logger') private readonly logger: Logger,
    @inject(JwtTokenService) private readonly jwtTokenService: JwtTokenService
  ) {}

  public hashPassword(password: string): string {
    return crypto.createHmac('sha256', password).digest('hex');
  }

  public verifyPassword(password: string, hashedPassword: string): boolean {
    const hashedInput = this.hashPassword(password);
    return hashedInput === hashedPassword;
  }

  public async register(dto: CreateUserDto): Promise<UserModel> {
    const existingUser = await UserEntity.findOne({ email: dto.email }).exec();

    if (existingUser) {
      this.logger.warn(`User with email ${dto.email} already exists`);
      throw new Error('User with this email already exists');
    }

    const hashedPassword = this.hashPassword(dto.password);
    const user = new UserEntity({
      ...dto,
      password: hashedPassword
    });

    this.logger.info(`Registering new user with email: ${dto.email}`);
    return user.save();
  }

  public async login(dto: LoginDto): Promise<AuthToken> {
    const user = await UserEntity.findOne({ email: dto.email }).exec();

    if (!user) {
      this.logger.warn(`Login attempt with non-existent email: ${dto.email}`);
      throw new Error('Invalid email or password');
    }
    
    let isValid = this.verifyPassword(dto.password, user.password);

    if (!isValid) {
      this.logger.warn(`Invalid password for user: ${dto.email}`);
      throw new Error('Invalid email or password');
    }

    const token = await this.jwtTokenService.generateToken(
      user._id.toString(),
      user.email
    );

    this.logger.info(`User ${dto.email} logged in successfully`);

    return {
      token,
      userId: user._id.toString()
    };
  }

  public async verifyToken(token: string): Promise<UserModel | null> {
    try {
      const payload = await this.jwtTokenService.verifyToken(token);
      if (!payload) {
        return null;
      }

      return UserEntity.findById(payload.userId).exec();
    } catch (error) {
      this.logger.error(`Token verification failed: ${error}`);
      return null;
    }
  }
  public async logout(_token: string): Promise<void> {
    // Для stateless JWT токенов logout не требует действий на сервере
    // Клиент просто удаляет токен
  }
}