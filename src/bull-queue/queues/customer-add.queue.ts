import { Queue, QueueScheduler } from 'bullmq';
import connection from '../helpers/connection';

import { QUEUES } from '../helpers/constants';

import customerAddWorker from '../workers/customer-add.worker';

const customerAddScheduler = new QueueScheduler(QUEUES.CUSTOMER_ADD, {connection});

// create queue to process csv
const campaignCallQueue = new Queue(QUEUES.CUSTOMER_ADD, {
  connection,
});

export const worker = customerAddWorker;
export const scheduler = customerAddScheduler;
export default campaignCallQueue;
