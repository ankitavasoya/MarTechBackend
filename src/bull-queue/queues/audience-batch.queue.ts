import { Queue } from 'bullmq';
import connection from '../helpers/connection';

import { QUEUES } from '../helpers/constants';

import audienceBatchWorker from '../workers/audience-batch.worker';

// create queue to process entire table to add customer to audience
const audienceBatchQueue = new Queue(QUEUES.AUDIENCE_BATCH, {
  connection,
});

export const worker = audienceBatchWorker;
export default audienceBatchQueue;
