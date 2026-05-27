import 'reflect-metadata';
import { Container } from 'inversify';
import { logger } from '../app/logger.js';
import { configSchema } from '../config/index.js';
import { Application } from '../app/application.js';
import { DatabaseService, UserService, OfferService, CommentService, AuthService } from '../database/index.js';
import { CommentController, OfferController, UserController } from '../common/controllers/index.js';
import { ExceptionFilter } from '../common/filters/exception-filter.js';
import { Logger } from 'pino';
import { CommandInterface } from '../../commands/command.interface.js';
import { HelpCommand } from '../../commands/help.command.js';
import { VersionCommand } from '../../commands/version.command.js';
import { ImportCommand } from '../../commands/import.command.js';
import { GenerateCommand } from '../../commands/index.js';
import { JwtTokenService } from '../../shared/libs/jwt-token/jwt-token.service.js';

const container = new Container();

container.bind<Logger>('Logger').toConstantValue(logger);
container.bind('Config').toConstantValue(configSchema);

container.bind(ExceptionFilter).toSelf();
container.bind(AuthService).toSelf()
container.bind(DatabaseService).toSelf();
container.bind(UserService).toSelf();
container.bind(OfferService).toSelf();
container.bind(CommentService).toSelf();
container.bind(UserController).toSelf();
container.bind(OfferController).toSelf();
container.bind(CommentController).toSelf();
container.bind(JwtTokenService).toSelf();

container.bind<CommandInterface>('HelpCommand').to(HelpCommand);
container.bind<CommandInterface>('VersionCommand').to(VersionCommand);
container.bind<CommandInterface>('ImportCommand').to(ImportCommand);
container.bind<CommandInterface>('GenerateCommand').to(GenerateCommand);

container.bind(Application).toSelf();

export { container };
