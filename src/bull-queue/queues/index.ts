import audienceBatchQueue from './audience-batch.queue';
import campaignCallQueue from './campaign-call.queue';
import campaignSmsQueue from './campaign-sms.queue';
import campaignStepProcessQueue from './campaign-step-process.queue';
import customerAdd from './customer-add.queue';

export const queues = {
  audienceBatchQueue,
  campaignCallQueue,
  campaignStepProcessQueue,
  campaignSmsQueue,
  customerAdd
};
