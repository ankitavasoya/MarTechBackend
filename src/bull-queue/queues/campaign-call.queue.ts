import { Queue, QueueScheduler } from 'bullmq';
import connection from '../helpers/connection';

import { QUEUES } from '../helpers/constants';

import campaignCallWorker from '../workers/campaign-call.worker';

const campaignCallScheduler = new QueueScheduler(QUEUES.CAMPAIGN_CALL, {connection});

// create queue to handle batch campaignCall
const campaignCallQueue = new Queue(QUEUES.CAMPAIGN_CALL, {
  connection,
});

export const worker = campaignCallWorker;
export const scheduler = campaignCallScheduler;
export default campaignCallQueue;
