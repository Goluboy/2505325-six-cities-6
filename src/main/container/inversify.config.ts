import 'reflect-metadata';
import { Container } from 'inversify';
import { configSchema } from '../config/index.js';
import { Application } from '../app/application.js';
import { DatabaseService, UserService, OfferService } from '../database/index.js';

const container = new Container();

container.bind('Config').toConstantValue(configSchema);
container.bind(Application).toSelf();
container.bind(DatabaseService).toSelf();
container.bind(UserService).toSelf();
container.bind(OfferService).toSelf();

export { container };
