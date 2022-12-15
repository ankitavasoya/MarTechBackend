import * as express from 'express';

import CheckAuth from '../middlewares/check-auth';
import AudienceController from '../controllers/audiences.controller';

const router = express.Router();

// route to get an audience list
router.get('/list',
  CheckAuth,
  AudienceController.getAudienceList,
);

// route to get an audience detail
router.get('/:id',
  CheckAuth,
  AudienceController.getAudienceDetail,
);


// route to create an audience list
router.post('/',
  CheckAuth,
  AudienceController.addAudienceList,
);

export default router;
