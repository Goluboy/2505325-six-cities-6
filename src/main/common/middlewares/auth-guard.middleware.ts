import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import { JwtTokenService } from '../../../shared/libs/jwt-token/index.js';
import { UnauthorizedError } from '../filters/exception-filter.js';

@injectable()
export class AuthGuardMiddleware {
  constructor(
    @inject('Logger') private readonly logger: Logger,
    @inject(JwtTokenService) private readonly jwtService: JwtTokenService
  ) {}

  public execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        this.logger.warn('Missing authorization header');
        return next(new UnauthorizedError('Missing or invalid authorization header'));
      }

      const token = authHeader.substring(7);
      const payload = await this.jwtService.verifyToken(token);

      if (!payload) {
        this.logger.warn('Invalid or expired token');
        return next(new UnauthorizedError('Invalid or expired token'));
      }

      (req as any).user = payload;
      this.logger.info(`User authenticated: ${payload.email}`);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
