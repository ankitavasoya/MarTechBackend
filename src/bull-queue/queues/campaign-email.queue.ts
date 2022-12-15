import { Queue, QueueScheduler } from 'bullmq';
import connection from '../helpers/connection';

import { QUEUES } from '../helpers/constants';

import campaignEmailWorker from '../workers/campaign-email.worker';

const campaignEmailScheduler = new QueueScheduler(QUEUES.CAMPAIGN_EMAIL, {connection});

// create queue to handle batch campaignEmail
const campaignEmailQueue = new Queue(QUEUES.CAMPAIGN_EMAIL, {
  connection,
});

export const worker = campaignEmailWorker;
export const scheduler = campaignEmailScheduler;
export default campaignEmailQueue;
