import { Request, Response, NextFunction } from 'express';
import { JwtTokenService, TokenPayload } from '../../../shared/libs/jwt-token/index.js';
import { UnauthorizedError } from '../filters/exception-filter.js';

export class AuthGuardMiddleware {
  constructor(private readonly jwtService: JwtTokenService) {}

  public execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7);
      const payload = await this.jwtService.verifyToken(token);
      
      if (!payload) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      (req as any).user = payload; // Явно приводим тип
      next();
    } catch (error) {
      next(error);
    }
  };
}