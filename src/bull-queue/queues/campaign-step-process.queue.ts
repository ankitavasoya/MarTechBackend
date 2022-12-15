import { Queue, QueueScheduler } from 'bullmq';
import connection from '../helpers/connection';

import { QUEUES } from '../helpers/constants';

import campaignStepProcessWorker from '../workers/campaign-step-process.worker';

const campaignStepProcessScheduler = new QueueScheduler(QUEUES.CAMPAING_STEP_TRIGGER, {connection});

// create queue to handle batch campaignStepProcess
const campaignStepProcessQueue = new Queue(QUEUES.CAMPAING_STEP_TRIGGER, {
  connection,
});

export const worker = campaignStepProcessWorker;
export const scheduler = campaignStepProcessScheduler;
export default campaignStepProcessQueue;
