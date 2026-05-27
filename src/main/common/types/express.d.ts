import { Request } from 'express';
import { TokenPayload } from '../../../shared/libs/jwt-token/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
