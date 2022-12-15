import * as express from 'express';
import fbAudienceController from '../controllers/fbAudiences.controller';

import CheckAuth from '../middlewares/check-auth';

const router = express.Router();

// route to post an fbaudience list
router.post('/post', CheckAuth, fbAudienceController.customAudience);

export default router;
