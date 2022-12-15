import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Response } from 'express';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import * as moment from 'moment';

import sequelize from '../db/config';

import catchAsync from '../utils/catchAsync';
import { Models } from '../db/models';
import AppError from '../utils/appError';
import * as Utils from '../utils/common';
import { CAMPAIGN_STATUS, MINIMUM_DELAY_IN_IMMEDIATE_JOBS_IN_SECONDS, MINIMUM_DELAY_TIME_FOR_MINUTES, MINIMUM_DELAY_IN_JOBS_IN_SECONDS } from '../utils/constants';
import { AppRequest } from '../utils/interface';
import { JOB_NAMES } from '../bull-queue/helpers/constants';
import CampaignStep, { CampaignStepInput, StepCampaignContentType, StepCampaignDelayTime, StepCampaignType } from '../db/models/campaign_step';
import Logger from '../utils/logger';
import { CampaignStepTriggerInput } from '../db/models/campaign_step_trigger';

import campaignStepProcessQueue from '../bull-queue/queues/campaign-step-process.queue';

const validateCampaignSteps = async (steps: any[], companyId: string) => {
  const errors: string[] = [];
  // validate each steps by running a loop
  for (const step of steps) {
    // we will validate each step name, delay time and all other fields
    if (_.isEmpty(Utils.getTrim(step.step_name))) {
      errors.push(`Step "${step.step_name}" Name is required`);
    }
    if (_.isEmpty(Utils.getTrim(step.step_delay_time))) {
      errors.push(`Step "${step.step_name}" Delay time is required`);
    }
    if (Utils.getTrim(step.step_delay_time) !== StepCampaignDelayTime.IMMEDIATELY && _.isEmpty(Utils.getTrim(step.step_delay_value))) {
      errors.push(`Step "${step.step_name}" Delay value is required`);
    }
    if (Utils.getTrim(step.step_delay_time) === StepCampaignDelayTime.MINUTES && parseInt(step.step_delay_value) < MINIMUM_DELAY_TIME_FOR_MINUTES) {
      errors.push(`Step "${step.step_name}" Delay value must be minimum ${MINIMUM_DELAY_TIME_FOR_MINUTES} minutes`);
    }
    if (_.isEmpty(Utils.getTrim(step.step_campaign_type)) || !_.includes(_.values(StepCampaignType), Utils.getTrim(step.step_campaign_type))) {
      errors.push(`Step "${step.step_name}" Campaign Type is required`);
    }
    if (_.isEmpty(Utils.getTrim(step.step_content_type)) || !_.includes(_.values(StepCampaignContentType), Utils.getTrim(step.step_content_type))) {
      errors.push(`Step "${step.step_name}" Content Type is required`);
    }
    if (Utils.getTrim(step.step_content_type) !== StepCampaignContentType.SALES_BRIDGE) {
      errors.push(`Step "${step.step_name}" Content Type can only be sales bridge for now`);
    }
    if (Utils.isContentTypeSalesBridge(step.step_content_type) && _.isEmpty(Utils.getTrim(step.step_sales_template))) {
      errors.push(`Step "${step.step_name}" Sales bridge template is required`);
    }
    if (Utils.isCampaignTypeCall(step.step_campaign_type) && Utils.isContentTypeSalesBridge(step.step_content_type) && !_.isEmpty(Utils.getTrim(step.step_sales_template))) {
      const salesRecording = await Models.SalesRecording.count({
        where: {
          sales_template_id: step.step_sales_template,
          is_deleted: false,
          is_selected: true,
        }
      });
      if (salesRecording === 0) {
        errors.push(`Step "${step.step_name}" Sales bridge template does not have any audio recordings.`);
      }
    }
    if (Utils.isCampaignTypeEmail(step.step_campaign_type)) {
      const emailSenders = await Models.EmailSender.count({
        where: {
          company_id: companyId,
        }
      });
      if (emailSenders === 0) {
        errors.push(`Step "${step.step_name}" No email senders found for company.`);
      }
    }
  };
  return errors;
}

const getCampaignsList = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  if (req.user.roleType !== 'superuser') {
    return next(new AppError('You do not have permission to access this page', 400));
  }
  const { page, count, filters } = req.query;
  const pageNumber = page && Utils.parseIntNumber(page.toString()) >= 0 ? Utils.parseIntNumber(page.toString()) : 0;
  const data = Utils.getPagination(pageNumber, count ? Utils.parseIntNumber(count.toString()) : 20);
  const filter = Utils.getQueryBuilder(filters);
  const filterWithCompany = { ...filter, company_id: req.user.company_id };
  const [campaigns, total] = await Promise.all([
    Models.Campaign.findAll({
      where: filterWithCompany,
      limit: data.limit,
      offset: data.offset,
      order: [
        ['createdAt', 'desc'],
      ],
      include: [
        {
          model: Models.Audience,
          as: 'audiences',
          attributes: ['audience_name']
        }
      ],
    }),
    Models.Campaign.count({
      where: filterWithCompany,
    }),
  ]);
  return res.status(200).json({ total, campaigns });
});

const addCampaign = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    // validate campaigns
    if (req.user.roleType !== 'superuser') {
      return next(new AppError('You do not have permission to create campaign', 400));
    }
    if (!Utils.getTrim(req.body.campaign_name)) {
      return next(new AppError('Please provide a campaign name!', 400));
    }
    if (!Utils.getTrim(req.body.audience_id)) {
      return next(new AppError('Please provide a audience!', 400));
    }

    if (!_.isArray(req.body.campaign_steps) || !req.body.campaign_steps.length) {
      return next(new AppError('Please provide atleast 1 campaign step!', 400));
    }

    // add validations
    const errors = await validateCampaignSteps(req.body.campaign_steps, req.user.company_id);
    if (errors.length) {
      return next(new AppError(_.join(errors, ', '), 400));
    }

    // if audience does not exists, show error
    const audience = await Models.Audience.findOne({
      where: {
        id: req.body.audience_id,
      },
    });

    if (!audience) {
      return next(new AppError('Please provide a valid audience!', 400));
    }

    // after validation we can create our campaign
    const result = await sequelize.transaction(async (t) => {
      const campaign = await Models.Campaign.create({
        id: uuidv4(),
        campaign_name: req.body.campaign_name,
        company_id: req.user.company_id,
        audience_id: req.body.audience_id,
        status: CAMPAIGN_STATUS.ACTIVE,
        createdBy: req.user.id,
        updatedBy: req.user.id,
      }, { transaction: t });

      // create campaign steps
      const promise: Promise<CampaignStepInput>[] = [];
      _.forEach(req.body.campaign_steps, (step, index) => {
        promise.push(Models.CampaignStep.create({
          campaign_id: campaign.id,
          step_name: Utils.getTrim(step.step_name),
          step_index: parseInt(index),
          step_campaign_type: Utils.getTrim(step.step_campaign_type) as StepCampaignType,
          step_campaign_content_type: Utils.getTrim(step.step_content_type) as StepCampaignContentType,
          step_delay_time: Utils.getTrim(step.step_delay_time) as StepCampaignDelayTime,
          step_delay_value: Utils.getTrim(step.step_delay_value),
          step_sales_template_id: Utils.getTrim(step.step_sales_template),
        }, { transaction: t }));
      });
      const campaignSteps = await Promise.all(promise);

      // now create campaign step triggers
      const campaignTriggers: Promise<CampaignStepTriggerInput>[] = [];
      // this will check if steps are continuously set to run immediately
      let nextStepToCheck = 0;
      let delay = 0; // after how much seconds we want to delay next campaign which is set to immediately
      // as we run cron on interval of 10 seconds, we will get rounded time to upcoming 10th
      // if time is 2:14, we will get time as 2:20
      let currentTime = Utils.getRoundTimeCeil(new Date(), moment.duration(MINIMUM_DELAY_IN_JOBS_IN_SECONDS, 'minutes')).toISOString();
      _.forEach(campaignSteps, (s: CampaignStep) => {
        const step = s.toJSON() as CampaignStepInput;
        const isImmediate = step.step_delay_time === StepCampaignDelayTime.IMMEDIATELY;
        // add all immediate jobs to queue to process which are starting or next to starting
        if (step.step_index === nextStepToCheck && isImmediate) {
          campaignStepProcessQueue.add(JOB_NAMES.CAMPAIGN.PROCESS_CAMPAING_STEP_TRIGGER, {
            campaignStep: { ...step, campaign },
          }, {
            delay,
          });
          delay += MINIMUM_DELAY_IN_IMMEDIATE_JOBS_IN_SECONDS;
          nextStepToCheck++;
        } else {
          // add time using previous step time, we will add time + step time to it
          if (!isImmediate) {
            const value = parseInt(step.step_delay_value);
            currentTime = moment(currentTime).add(value, step.step_delay_time as moment.DurationInputArg2).toISOString();
          }
          Logger.info(currentTime);
          campaignTriggers.push(
            Models.CampaignStepTrigger.create({
              campaign_step_id: step.id,
              trigger_at: currentTime,
            }, { transaction: t }));
        }
      });

      // create campaign future triggers
      await Promise.all(campaignTriggers);

      // return the campaign instance
      return campaign;
    });

    return res.status(200).json({
      campaign: result,
    });
  } catch (e) {
    next(e);
  }
});

// this cron is used to find campaign steps that needs to be triggered now
const runCampaignTriggerCron = async (/* req: AppRequest, res: Response, next: NextFunction */) => {
  try {
    Logger.info('Checking for campaign that needs to be trigged');
    Logger.info(moment().subtract(MINIMUM_DELAY_IN_JOBS_IN_SECONDS, 'minutes').toISOString())
    Logger.info(moment().toISOString())
    const campaignStepsTrigger = await Models.CampaignStepTrigger.findAll({
      where: {
        trigger_at: {
          [Op.gte]: moment().subtract(MINIMUM_DELAY_IN_JOBS_IN_SECONDS, 'minutes').toISOString(),
          [Op.lte]: moment().toISOString(),
        }
      },
      include: [
        {
          required: true,
          model: Models.CampaignStep,
          as: 'campaignStep',
          attributes: ['id', 'campaign_id', 'step_name', 'step_campaign_type', 'step_campaign_content_type', 'step_sales_template_id'],
          include: [{
            model: Models.Campaign,
            as: 'campaign',
            where: {
              status: CAMPAIGN_STATUS.ACTIVE, // fetch campaign details only when its active, we only want to run active campaigns
            },
            attributes: ['campaign_name', 'audience_id', 'company_id']
          }]
        }
      ],
    });
    Logger.info(`${campaignStepsTrigger.length} campaigns steps found to trigger`);
    // If there are more than 1 campaign steps needs to process at same time, we will add a delay time between them
    let delay = 0;
    _.forEach(campaignStepsTrigger, (stepTrigger: CampaignStepTriggerInput) => {
      campaignStepProcessQueue.add(JOB_NAMES.CAMPAIGN.PROCESS_CAMPAING_STEP_TRIGGER, {
        campaignStep: stepTrigger.campaignStep,
      }, {
        delay,
      });
      delay += MINIMUM_DELAY_IN_IMMEDIATE_JOBS_IN_SECONDS;
    });
    return campaignStepsTrigger; // res.send(campaignStepsTrigger);
  } catch (e) {
    Logger.error(e);
    throw e;
  }
}

const unsubscribeCompany = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const companyId = Utils.decodeBase64(req.query.co ? req.query.co?.toString() : '');
    const customerId = Utils.decodeBase64(req.query.cu ? req.query.cu.toString() : '');
    let message = '';
    if (companyId && customerId) {
      const customer = await Models.Customer.findOne({
        where: {
          id: customerId,
          company_id: companyId,
        }
      });
      if (customer) {
        if (customer.is_unsubscribe_from_campaign) {
          message = 'Already unsubsribed';
        } else {
          await Models.Customer.update(
            {
              is_unsubscribe_from_campaign: true,
            },
            {
              where: {
                id: customerId,
              },
            },
          );
          message = 'Successfully unsubsribed';
        }
      } else {
        message = 'Not found';
      }
    }
    res.send({
      message
    });
  } catch (e) {
    return next(e);
  }
};

const getCampaignDetail = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const campaign = await Models.Campaign.findOne({
    where: { id },
  });
  const campaign_steps = await Models.CampaignStep.findAll({
    where: { campaign_id: id },
  });
  return res.status(200).json({...JSON.parse(JSON.stringify(campaign)), campaign_steps});
});

// delete Campaign Controller 
const deleteCampaign = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  console.log(id)
  
  await Models.Campaign.destroy({
    where: { id },
  });
  
  return res.status(200).json({});
});

export const CampaignController = {
  getCampaignsList,
  addCampaign,
  runCampaignTriggerCron,
  unsubscribeCompany,
  getCampaignDetail,
  deleteCampaign
}