import convict from 'convict';
import { ipaddress } from 'convict-format-with-validator';
import 'dotenv/config.js';

convict.addFormat(ipaddress);

const configSchema = convict({
  port: {
    doc: 'Port for incoming connections',
    format: 'port',
    env: 'PORT',
    default: 4000,
  },
  dbHost: {
    doc: 'Database host address',
    format: 'ipaddress',
    env: 'DB_HOST',
    default: '127.0.0.1',
  },
  dbPort: {
    doc: 'Database port',
    format: 'port',
    env: 'DB_PORT',
    default: 27017,
  },
  dbName: {
    doc: 'Database name',
    format: String,
    env: 'DB_NAME',
    default: 'six-cities',
  },
  salt: {
    doc: 'Salt for password hashing',
    format: String,
    env: 'SALT',
    default: 'default-salt-value',
  },
  dbUser: {
    doc: 'Database user',
    format: String,
    env: 'DB_USER',
    default: 'admin',
  },
  dbPassword: {
    doc: 'Database password',
    format: String,
    env: 'DB_PASSWORD',
    default: 'test',
  },
  uploadDirectory: {
    doc: 'Directory for user-uploaded files',
    format: String,
    env: 'UPLOAD_DIRECTORY',
    default: './uploads',
  },
  jwtSecret: {
    doc: 'Secret key for JWT',
    format: String,
    env: 'JWT_SECRET',
    default: 'default-secret-key12345367869',
  }
});

configSchema.validate({ allowed: 'strict' });

export { configSchema };
