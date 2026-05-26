import { inject, injectable } from 'inversify';
import { configSchema } from '../config/index.js';
import { Logger } from 'pino';
import express, { Application as ExpressApp, ErrorRequestHandler } from 'express';
import { OfferController, UserController } from '../common/controllers/index.js';
import { DatabaseService } from '../database/index.js';
import { ExceptionFilter } from '../common/filters/exception-filter.js';
import { CommentController } from '../common/controllers/comment.controller.js';

@injectable()
class Application {
  private readonly expressApp: ExpressApp;

  constructor(
    @inject('Logger') private readonly logger: Logger,
    @inject(OfferController) private readonly offerController: OfferController,
    @inject(UserController) private readonly userController: UserController,
    @inject(CommentController) private readonly commentContholler: CommentController,
    @inject(DatabaseService) private readonly databaseService: DatabaseService,
    @inject(ExceptionFilter) private readonly exceptionFilter: ExceptionFilter
  ) {
    this.expressApp = express();
  }

  public registerMiddlewares(): void {
    this.expressApp.use(express.json());
    this.logger.info('Middleware registered: express.json()');
  }

  public registerExceptionFilter(): void {
    const errorHandler: ErrorRequestHandler = (err: Error, req: any, res: any, next: any) => {
      this.exceptionFilter.catch(err, req, res, next);
    };
    this.expressApp.use(errorHandler);
    this.logger.info('Exception filter registered');
  }

  public registerRoutes(): void {
    this.expressApp.use('/api', this.offerController.router);
    this.expressApp.use('/api', this.userController.router);
    this.expressApp.use('/api', this.commentContholler.router);
    
  }

  registerStatic() {
    this.expressApp.use('/uploads', express.static(configSchema.get('uploadDirectory')));
  }


  public async init(): Promise<void> {
    this.registerMiddlewares();
    this.registerRoutes();
    this.registerExceptionFilter();
    this.registerStatic();
    const port = configSchema.get('port');
    const dbHost = configSchema.get('dbHost');
    const dbPort = configSchema.get('dbPort');
    const dbName = configSchema.get('dbName');
    const dbUser = configSchema.get('dbUser');
    const dbPassword = configSchema.get('dbPassword');
    const databaseUri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;

    try {
      await this.databaseService.connect(databaseUri);
    } catch (error) {
      this.logger.error('Failed to connect to database during initialization');
      throw error;
    }

    return new Promise((resolve, reject) => {
      try {
        const server = this.expressApp.listen(port, () => {
          this.logger.info('Application initialized');
          this.logger.info(`Server started on port ${port}`);
          resolve();
        });

        server.on('error', (err: NodeJS.ErrnoException) => {
          this.logger.error(err, 'Failed to start server');
          reject(err);
        });
      } catch (err) {
        this.logger.error(err, 'Unexpected error during initialization');
        reject(err);
      }
    });
  }

  public getExpressApp(): ExpressApp {
    return this.expressApp;
  }
}

export { Application };
