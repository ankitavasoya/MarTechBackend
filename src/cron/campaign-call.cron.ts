import * as dotenv from 'dotenv';
dotenv.config();

import { CampaignController } from '../controllers/campaign.controller';

import sequelize from '../db/config';
import { App } from '../app';
import Logger from '../utils/logger';

export const getCampaignsToRun = async () => {
  try {
    await sequelize.authenticate();
    const app = new App();
    Logger.info('DB Connection has been established successfully.');
    Logger.info('Campaign Cron Running');

    await CampaignController.runCampaignTriggerCron();

  } catch (e) {
    console.error(`Error starting DB server: ${e.message}`);
    process.exit(1);
  }
};

getCampaignsToRun();