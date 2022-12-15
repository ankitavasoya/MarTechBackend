import * as express from 'express';

import CheckAuth from '../middlewares/check-auth';

import IndustryController from '../controllers/industryController';

const router = express.Router();

router.get('/list', CheckAuth, IndustryController.listIndustries);

export default router;
