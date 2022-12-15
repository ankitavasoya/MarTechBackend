import * as express from 'express';

import CheckAuth from '../middlewares/check-auth';

import SmsController from '../controllers/sms';

const router = express.Router();

router.post('/', CheckAuth, SmsController.sendSMS);

router.get('/', CheckAuth, SmsController.getAllmessages);

// no need to add CheckAuth, twilio calls it
router.post('/receive/:id', SmsController.receiveSMS);
router.post('/voice', SmsController.voiceResponse);

router.post('/dtmf-callback', SmsController.dtmfResponse);

router.post('/token/generate', CheckAuth, SmsController.generateToken);

export default router;
