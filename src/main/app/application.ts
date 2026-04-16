import { injectable } from 'inversify';
import { logger } from './logger.js';
import { configSchema } from '../config/index.js';

@injectable()
class Application {
  public init(): void {
    const port = configSchema.get('port');
    logger.info('Application initialized');
    logger.info(`Port: ${port}`);
  }
}

export { Application };
