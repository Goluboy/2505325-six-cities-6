import { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';
import mime from 'mime-types';
import { nanoid } from 'nanoid';
import { IMiddleware } from '../interfaces/middleware.interface.js';

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const ext = mime.extension(file.mimetype) || 'dat';
    cb(null, `${nanoid()}.${ext}`);
  }
});

const uploader = multer({ storage });

export class UploadMiddleware implements IMiddleware {
  private fieldName: string;

  constructor(fieldName: string) {
    this.fieldName = fieldName;
  }

  public execute: RequestHandler = (req: Request, res: Response, next: NextFunction) =>
    uploader.single(this.fieldName)(req, res, next);
}
