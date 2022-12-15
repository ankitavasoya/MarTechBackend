import * as express from 'express';
import * as cors from 'cors';
import * as compression from 'compression';

import { Server } from 'http';
import { createBullBoard } from 'bull-board';
import { BullMQAdapter } from 'bull-board/bullMQAdapter';

import AppError from './utils/appError';
import { Config } from './utils/config';

import userRouter from './routes/userRoutes';

import customerRoutes from './routes/customerRoutes';
import industryRouter from './routes/industryRoutes';

import smsRouter from './routes/smsRoutes';
import logsRouter from './routes/callLogsRoutes';
import companyRouter from './routes/companyRoutes';
import audienceRoutes from './routes/audienceRoutes';
import campaignRoutes from './routes/campaignRoutes';
import tagsRoutes from './routes/tagsRoutes';
import fbAudienceRoutes from './routes/fbAudienceRoutes'
import globalErrorHandler from './controllers/errorController';

// queues
import { queues as AllQueues } from './bull-queue/queues';
import { workers } from './bull-queue/workers';
import { CampaignController } from './controllers/campaign.controller';
export class App {
  public app: express.Application;

  constructor() {
    const { router, setQueues, replaceQueues, addQueue, removeQueue } = createBullBoard(this.registerQueueForBullBoard())

    /**
     * Create our app w/ express
     */
    this.app = express();
    this.app.use(cors());

    this.app.use(compression());

    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.static(`${__dirname}/storage`));

    // support parsing of application/x-www-form-urlencoded post data
    this.app.use(express.urlencoded({ extended: true }));

    /**
     * Setting routes
   */
    // permissions
    this.app.get('/', (req, res) => {
      res.send({
        message: 'API is running'
      })
    });
    this.app.use('/admin/bull-board', router);
    // registering bull

    this.app.use('/api/v1/users', userRouter);
    this.app.use('/api/v1/industries', industryRouter);
    this.app.use('/api/v1/account', companyRouter);
    this.app.use('/api/v1/account/audiences', audienceRoutes);
    this.app.use('/api/v1/account/fbaudiences', fbAudienceRoutes);
    this.app.use('/api/v1/account/campaigns', campaignRoutes);
    this.app.use('/api/v1/account/tags', tagsRoutes);
    this.app.use('/api/v1/customers', customerRoutes);
    this.app.use('/api/v1/sms', smsRouter);
    this.app.use('/api/v1/logs', logsRouter);
    this.app.get('/email/unsubsribe/', CampaignController.unsubscribeCompany);

    this.app.all('*', (req, res, next) => {
      next(new AppError(`can't find ${req.originalUrl}`, 404));
    });

    this.app.use(globalErrorHandler);
  }

  public listen(): Server {
    const PORT = Config.port;
    const server = this.app.listen(PORT);
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      const port = PORT
      const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

      switch (error.code) {
        case 'EACCES':
          console.error(`www - ${bind} requires elevated privileges`);
          process.exit(1);
        case 'EADDRINUSE':
          console.error(`www - ${bind} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });
    return server;
  }

  private registerQueueForBullBoard(): BullMQAdapter[] {
    const queues = Object.values(AllQueues);
    return queues.map(queueName => new BullMQAdapter(queueName));
  }
}
