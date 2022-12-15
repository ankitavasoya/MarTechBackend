import { Worker, Job, JobsOptions } from 'bullmq'
import * as _ from 'lodash';

import { QUEUES, JOB_NAMES, RETRY_CONFIG } from '../helpers/constants';
import Logger from '../../utils/logger';
import { Models } from '../../db/models';
import { getPagination, isCampaignTypeCall, isCampaignTypeEmail, isCampaignTypeSMS, isContentTypeSalesBridge } from '../../utils/common';
import { CampaignStepInput, StepCampaignType } from '../../db/models/campaign_step';
import campaignCallQueue from '../queues/campaign-call.queue';
import campaignSmsQueue from '../queues/campaign-sms.queue';
import campaignEmailQueue from '../queues/campaign-email.queue';

import { MINIMUM_DELAY_IN_PROCESSING_CUSTOMERS_JOBS_IN_SECONDS } from '../../utils/constants';
import { FindOptions } from 'sequelize/types';
import { CustomerInput } from '../../db/models/customer';
import connection from '../helpers/connection';

const isCallAndSalesBridge = (campaignStep: CampaignStepInput) => {
  return isCampaignTypeCall(campaignStep.step_campaign_type)
    && isContentTypeSalesBridge(campaignStep.step_campaign_content_type);
}

const isSMSAndSalesBridge = (campaignStep: CampaignStepInput) => {
  return isCampaignTypeSMS(campaignStep.step_campaign_type)
    && isContentTypeSalesBridge(campaignStep.step_campaign_content_type);
}

const isEmailAndSalesBridge = (campaignStep: CampaignStepInput) => {
  return isCampaignTypeEmail(campaignStep.step_campaign_type)
    && isContentTypeSalesBridge(campaignStep.step_campaign_content_type);
}

const getCustomerFindObject = (campaignStep: CampaignStepInput, includeAddress: boolean = false, campaignType: StepCampaignType): FindOptions => {
  const customerWhereObject: any = {
    is_deleted: false,
  };
  if (isCampaignTypeCall(campaignType) || isCampaignTypeSMS(campaignType)) {
    customerWhereObject.is_optout_from_campaign = false;
  }
  if (isCampaignTypeEmail(campaignType)) {
    customerWhereObject.is_unsubscribe_from_campaign = false;
  }
  const filter: any = {
    where: {
      audience_id: campaignStep.campaign.audience_id,
    },
    include: [
      {
        model: Models.Customer,
        as: 'customer',
        where: customerWhereObject,
      }
    ],
  }
  if (includeAddress) {
    filter.include[0].include = [
      {
        model: Models.CustomerAddress,
        as: 'customerAddress',
      },
    ];
  }
  return filter;
}

const campaignStepProccessWorker = new Worker(QUEUES.CAMPAING_STEP_TRIGGER, async (job: Job<{ campaignStep: CampaignStepInput }>) => {
  try {
    Logger.info('Job Started Campaign Trigger');
    Logger.info(`${job.id} ${job.name}`);

    const { campaignStep } = job.data;
    // if no data found, log it
    if (!campaignStep) {
      Logger.info(`No campaign step to process for campaign step ${campaignStep.id}`);
    }
    // if campaign found, we will start processing
    if (campaignStep) {
      Logger.info(`Will process ${campaignStep.step_name} of campaign ${campaignStep.campaign.campaign_name} of type ${campaignStep.step_campaign_type}`);
      const findObjectCount = getCustomerFindObject(campaignStep, false, campaignStep.step_campaign_type);
      const promise: any[] = [
        Models.AudienceCustomer.count(findObjectCount),
        Models.Company.findOne({
          where: {
            id: campaignStep.campaign.company_id,
          },
          include: [
            {
              model: Models.EmailSender,
              // required: false,
              as: 'emailSenders',
            },
          ],
        }),
        isCallAndSalesBridge(campaignStep) ? Models.SalesRecording.findAll({
          where: {
            sales_template_id: campaignStep.step_sales_template_id,
            is_deleted: false,
            is_selected: true,
          }
        }) : null,
        isSMSAndSalesBridge(campaignStep) || isEmailAndSalesBridge(campaignStep) ? Models.SalesTemplate.findOne({
          where: {
            id: campaignStep.step_sales_template_id,
          }
        }) : null,
      ];
      // find unique customer for which the campaign step is not triggered
      const [
        totalCustomers,
        company,
        salesRecordings,
        salesTemplate
      ] = await Promise.all(promise);
      Logger.info(`Found total ${totalCustomers} to process for ${campaignStep.step_name} of campaign ${campaignStep.campaign.campaign_name}`);
      const count = 500; // to add in queue
      let delay = 0; // after how much seconds we want to delay next processing
      const sendCustomersToCampaignQueue = async (index = 0, page = 0): Promise<number> => {
        Logger.info(`Looking for customers in page ${page} to process for ${campaignStep.step_name} of campaign ${campaignStep.campaign.campaign_name}`);
        if (index >= totalCustomers) {
          Logger.info(`No more customers available to process for ${campaignStep.step_name} of campaign ${campaignStep.campaign.campaign_name}`);
          return totalCustomers;
        }
        const pageNumber = page && parseInt(page.toString()) >= 0 ? parseInt(page.toString()) : 0;
        const data = getPagination(pageNumber, count ? parseInt(count.toString()) : 20);
        const findObject = getCustomerFindObject(campaignStep, true, campaignStep.step_campaign_type);
        const audiences = await Models.AudienceCustomer.findAll({ ...findObject, limit: data.limit, offset: data.offset });
        Logger.info(`Will add ${audiences.length} in queue to process for ${campaignStep.step_name} of campaign ${campaignStep.campaign.campaign_name}`);

        // add to call Queue if type 
        const campaignData: any = {
          audiences,
          campaignStep,
          company,
          salesRecordings,
          salesTemplate,
        };
        const jobOptions: JobsOptions = {
          ...RETRY_CONFIG,
          delay,
        }
        if (isCampaignTypeCall(campaignStep.step_campaign_type)) {
          campaignCallQueue.add(JOB_NAMES.CAMPAIGN.PROCESS_CALLS, campaignData, jobOptions);
          delay += MINIMUM_DELAY_IN_PROCESSING_CUSTOMERS_JOBS_IN_SECONDS;
        } else if (isCampaignTypeSMS(campaignStep.step_campaign_type)) {
          campaignSmsQueue.add(JOB_NAMES.CAMPAIGN.PROCESS_SMS, campaignData, jobOptions);
          delay += MINIMUM_DELAY_IN_PROCESSING_CUSTOMERS_JOBS_IN_SECONDS;
        } else if (isCampaignTypeEmail(campaignStep.step_campaign_type)) {
          campaignEmailQueue.add(JOB_NAMES.CAMPAIGN.PROCESS_EMAIL, campaignData, jobOptions);
          delay += MINIMUM_DELAY_IN_PROCESSING_CUSTOMERS_JOBS_IN_SECONDS;
        }
        index += count;
        page += 1;
        return sendCustomersToCampaignQueue(index, page);
      }
      await sendCustomersToCampaignQueue();
    }
    return campaignStep;
  } catch (e) {
    Logger.error(`Error occurred while processing job ${job.id} ${job.name}`);
    throw e;
  }
},
{connection});

campaignStepProccessWorker.on('completed', (job: Job) => {
  Logger.info('Job Completed');
  Logger.info(`${job.id} ${job.name}`);
  return job;
});

campaignStepProccessWorker.on('error', (err) => {
  Logger.error('Job Error');
  Logger.error(err);
  return err;
});

campaignStepProccessWorker.on('failed', (err) => {
  Logger.error('Job Failed');
  Logger.error(err);
  return err;
});

export default campaignStepProccessWorker;