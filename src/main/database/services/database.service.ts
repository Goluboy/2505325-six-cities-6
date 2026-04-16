import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { logger } from '../../app/logger.js';
import { DatabaseServiceInterface } from './database-service.interface.js';

@injectable()
export class DatabaseService implements DatabaseServiceInterface {
  private isConnected = false;

  public async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      logger.warn('Database connection already established');
      return;
    }

    try {
      logger.info(`Attempting to connect to database: ${uri}`);
      await mongoose.connect(uri);
      this.isConnected = true;
      logger.info('Successfully connected to database');
    } catch (error) {
      logger.error(`Failed to connect to database: ${(error as Error).message}`);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from database');
    } catch (error) {
      logger.error(`Error disconnecting from database: ${(error as Error).message}`);
      throw error;
    }
  }
}
