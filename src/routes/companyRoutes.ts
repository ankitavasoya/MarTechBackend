import * as express from 'express';

import CheckAuth from '../middlewares/check-auth';
import CompanyController from '../controllers/companyController';

const router = express.Router();

router.get('/', CheckAuth, CompanyController.getCompanyDetails);

// route to upload sales template recording
router.post(
  '/sales-templates/recordings/upload',
  CheckAuth,
  CompanyController.uploadAudioToS3,
);

// route to create sales template
router.post(
  '/sales-templates',
  CheckAuth,
  CompanyController.addCompanySalesTemplates,
);

// route to get all sales templates of a company
router.get(
  '/sales-templates/list',
  CheckAuth,
  CompanyController.getCompanySalesTemplates,
);

// route to get sales templates detail
router.get(
  '/sales-templates/:id',
  CheckAuth,
  CompanyController.getCompanySalesTemplateDetails,
);

// route to update sales templates
router.put(
  '/sales-templates/:id',
  CheckAuth,
  CompanyController.updateCompanySalesTemplates,
);

// route to delete a particular recording
router.delete(
  '/sales-templates/recordings/:id',
  CheckAuth,
  CompanyController.deleteAudioRecording,
);

router.put('/:company_id', CheckAuth, CompanyController.updateCompanySettings);

export default router;
