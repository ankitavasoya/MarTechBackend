import { Worker, Job } from 'bullmq'
import { Op } from 'sequelize';
import * as _ from 'lodash';

import { CAMPAIGN_PHONE_NUMBERS_SMS_SEND, QUEUES } from '../helpers/constants';
import Logger from '../../utils/logger';
import { CampaignStepInput } from '../../db/models/campaign_step';
import { CustomerInput } from '../../db/models/customer';
import { Models } from '../../db/models';
import { AudienceCustomerInput } from '../../db/models/audience_customer';
import { CompanyInput } from '../../db/models/company';
import { TwilioHelper } from '../../utils/twilio';
import { SalesTemplateInput } from '../../db/models/salestemplates';
import connection from '../helpers/connection';

const campaignSMSWorker = new Worker(QUEUES.CAMPAIGN_SMS, async (job: Job<{
  campaignStep: CampaignStepInput,
  audiences: AudienceCustomerInput[],
  company: CompanyInput,
  salesTemplate: SalesTemplateInput
}>) => {
  Logger.info('Job Started Process Customer SMS');
  Logger.info(`${job.id} ${job.name}`);
  const campaignStep = job.data.campaignStep;
  const audiences = job.data.audiences;
  const company = job.data.company;
  const audienceId = campaignStep.campaign.audience_id;
  const salesTemplate = job.data.salesTemplate;


  // Now we have 500 Phone numbers, send them in batch of 50 each
  // Means 10 requests
  // 10 Promise.all of 50 numbers
  const batch = CAMPAIGN_PHONE_NUMBERS_SMS_SEND;
  Logger.info(`Will SMS for ${campaignStep.step_name} of campaign ${campaignStep.campaign.campaign_name}`);
  Logger.info(`Sending SMS to ${audiences.length}`);
  const sendSMSToTwilio = async (index = 0): Promise<any> => {
    if (index >= audiences.length) {
      return;
    }
    // let send 50 sms at a same time
    // we will send only unique customers
    const audiencesBatch = _.slice(audiences, index, index + batch);
    Logger.info(`Sending Batch SMS to ${audiencesBatch.length} for ${campaignStep.step_name} of campaign ${campaignStep.campaign.campaign_name}`);
    const existingCampaignLogs = await Models.CampaignStepLog.findAll({
      where: {
        audience_id: audienceId,
        campaign_step_id: campaignStep.id,
        customer_id: {
          [Op.in]: _.map(audiencesBatch, 'customer.id'),
        }
      }
    });

    // get the unique customer only for which this particular campaign is sent
    const customersNotSentAlready = _.xorBy(audiencesBatch, existingCampaignLogs, 'customer_id');
    Logger.info(`After Filter: Sending Batch SMS to ${customersNotSentAlready.length} for ${campaignStep.step_name} of campaign ${campaignStep.campaign.campaign_name}`);

    const twilioHelper = new TwilioHelper(company.twilio_account_sid, company.twilio_auth_token);
    const message = salesTemplate.message;
    const callInstances = await twilioHelper.makeSMSOneByOne(customersNotSentAlready, message, company.twilio_message_service_id);
    // convert audio to mp3
    const promise: any[] = [];
    _.forEach(customersNotSentAlready, (customer) => {
      promise.push(Models.CampaignStepLog.create({
        campaign_step_id: campaignStep.id,
        audience_id: audienceId,
        customer_id: customer.customer_id,
      }));
    });
    await Promise.all(promise);
    index += batch;
    Logger.info(`Sent Batch SMS to ${customersNotSentAlready.length} for ${campaignStep.step_name} of campaign ${campaignStep.campaign.campaign_name}`);
    return sendSMSToTwilio(index);
  }
  await sendSMSToTwilio();
  return job.id;
},
{connection});

campaignSMSWorker.on('completed', (job: Job) => {
  Logger.info('Job Completed');
  Logger.info(`${job.id} ${job.name}`);
  return job;
});

campaignSMSWorker.on('error', (err) => {
  Logger.error('Job Error');
  Logger.error(err);
  return err;
});

campaignSMSWorker.on('failed', (err) => {
  Logger.error('Job Failed');
  Logger.error(err);
  return err;
});

export default campaignSMSWorker;