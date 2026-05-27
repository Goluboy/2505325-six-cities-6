import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { Logger } from 'pino';
import { JwtTokenService } from '../../../shared/libs/jwt-token/index.js';
import { UnauthorizedError } from '../filters/exception-filter.js';

@injectable()
export class AuthGuardMiddleware {
  constructor(
    @inject(JwtTokenService) private readonly jwtService: JwtTokenService
  ) {}

  public execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Missing or invalid authorization header'));
      }

      const token = authHeader.substring(7);
      const payload = await this.jwtService.verifyToken(token);

      if (!payload) {
        return next(new UnauthorizedError('Invalid or expired token'));
      }

      (req as any).user = payload;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
