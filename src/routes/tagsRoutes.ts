import * as express from 'express';

import CheckAuth from '../middlewares/check-auth';
import { TagsController } from '../controllers/tags.controller';

const router = express.Router();

// route to get tag list
router.get('/list',
  CheckAuth,
  TagsController.getTagsList,
);

// route to create tag list
router.post('/',
  CheckAuth,
  TagsController.addTag,
);

// route to edit tag list
router.put('/:id',
  CheckAuth,
  TagsController.editTag,
);

export default router;
