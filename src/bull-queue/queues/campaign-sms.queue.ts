import { Queue, QueueScheduler } from 'bullmq';
import connection from '../helpers/connection';

import { QUEUES } from '../helpers/constants';

import campaignSmsWorker from '../workers/campaign-sms.worker';

const campaignSmsScheduler = new QueueScheduler(QUEUES.CAMPAIGN_SMS, {connection});

// create queue to handle batch campaignSms
const campaignSmsQueue = new Queue(QUEUES.CAMPAIGN_SMS, {
  connection,
});

export const worker = campaignSmsWorker;
export const scheduler = campaignSmsScheduler;
export default campaignSmsQueue;
