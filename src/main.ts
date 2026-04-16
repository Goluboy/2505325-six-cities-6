import 'reflect-metadata';
import { Application } from './main/app/index.js';
import { container } from './main/container/inversify.config.js';
import { configSchema } from './main/config/index.js';

configSchema.validate({ allowed: 'strict' });

const application = container.get(Application);
application.init();