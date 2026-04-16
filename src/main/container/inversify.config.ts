import 'reflect-metadata';
import { Container } from 'inversify';
import { configSchema } from '../config/index.js';
import { Application } from '../app/application.js';

const container = new Container();

container.bind('Config').toConstantValue(configSchema);
container.bind(Application).toSelf();

export { container };
