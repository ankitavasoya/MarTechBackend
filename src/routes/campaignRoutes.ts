import * as express from 'express';

import CheckAuth from '../middlewares/check-auth';
import { CampaignController } from '../controllers/campaign.controller';

const router = express.Router();

// route to get an audience list
router.get('/list',
  CheckAuth,
  CampaignController.getCampaignsList,
);

// route to get an campaign detail
router.get('/:id',
  CheckAuth,
  CampaignController.getCampaignDetail,
);

// route to delete an campaign detail
router.delete('/:id',
  CheckAuth,
  CampaignController.deleteCampaign,
);

// route to create an audience list
router.post('/',
  CheckAuth,
  CampaignController.addCampaign,
);

router.get('/cron/campaign-trigger',
  CampaignController.runCampaignTriggerCron,
);

export default router;
