import * as dotenv from 'dotenv';

dotenv.config();

import sequelize from './db/config';
import { App } from './app';
import Logger from './utils/logger';

sequelize
  .authenticate()
  .then(() => {
    Logger.info('DB Connection has been established successfully.');
    const app = new App();
    const server = app.listen();
    server.on('listening', () => {
      /**
       * Event listener for HTTP server "listening" event.
       */
      const addr = server.address();
      const bind = (typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`);
      Logger.info(`Listening on ${bind}`);
    });
    process.on('SIGINT', () => {
      server.close((err) => {
        Logger.info('www - sigint event received, attempting to shut down application...');
        if (err) {
          Logger.error(
            `www - encountered error while shutting down server - ${err.message}`,
          );
          process.exit(1);
        } else {
          Logger.info(
            'www - server was closed gracefully, shutting down...',
          );
          process.exit(0);
        }
      });
    });
  })
  .catch((error: Error) => {
    Logger.error(`Error starting HTTP server: ${error.message}`);
    process.exit(1);
  });