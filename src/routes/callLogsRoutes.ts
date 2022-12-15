import * as express from 'express';

import CheckAuth from '../middlewares/check-auth';
import CallLogsController from '../controllers/callLogsController';

const router = express.Router();

router.post('/', CheckAuth, CallLogsController.addLogRoute);

export default router;
