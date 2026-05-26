import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../filters/index.js';
import { IMiddleware } from '../interfaces/middleware.interface.js';

export interface EntityExistsService {
  findById(id: string): Promise<any>;
}

export class CheckEntityExistsMiddleware implements IMiddleware {
  private readonly service: EntityExistsService;
  private readonly paramName: string;

  constructor(service: EntityExistsService, paramName = 'id') {
    this.service = service;
    this.paramName = paramName;
  }

  public execute = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[this.paramName];

    if (typeof id !== 'string') {
        throw new BadRequestError(`'${this.paramName}' must be str`);
    }

    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: `Parameter "${this.paramName}" is required`
      });
      return;
    }

    const entity = await this.service.findById(id);
    if (!entity) {
      res.status(StatusCodes.NOT_FOUND).json({
        status: 'error',
        message: `Entity with id "${id}" not found`
      });
      return;
    }

    next();
  };
}