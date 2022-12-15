/* eslint-disable implicit-arrow-linebreak */
import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Response } from 'express';


import * as util from 'util';
import * as _ from 'lodash';
import { Op } from 'sequelize';

import catchAsync from '../utils/catchAsync';
import { Models } from '../db/models';
import AppError from '../utils/appError';
import * as Utils from '../utils/common';
import * as Constants from '../utils/constants';
import AWSUtils from '../utils/aws';
import { AppRequest } from '../utils/interface';
import { TemplateType } from '../db/models/salestemplates';

// this will create recording record in database for a particular template
const getAddRecordingPromise = (files: any[], template: any) => {
  const promise: any = [];
  _.forEach(files, (file) => {
    if (_.isString(file.url)) {
      promise.push(
        Models.SalesRecording.create({
          id: uuidv4(),
          url: file.url,
          sales_template_id: template.id,
          is_selected: file.isSelected || false,
          is_deleted: false,
        }),
      );
    }
  });
  return promise;
};

// this will update recordings isSelected value
const getUpdateRecordingPromise = (files: any[]) => {
  const promise: any[] = [];
  _.forEach(files, (file) => {
    promise.push(
      Models.SalesRecording.update(
        {
          is_selected: file.isSelected || false,
        },
        {
          where: {
            id: file.id,
          },
        },
      ),
    );
  });
  return promise;
};

const getCompanyDetails = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  if (req.user.roleType !== 'superuser') {
    return next(new AppError('You do not have permission to access this page', 400));
  }
  const company = await Models.Company.findOne({
    where: {
      id: req.user.company_id,
    },
    include: [
      {
        model: Models.EmailSender,
        // required: false,
        as: 'emailSenders',
      },
    ],
  });
  return res.status(200).json({ companyDetails: company });
});

const updateCompanySettings = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  if (!req.body.company_id) {
    return next(new AppError('You are not allowed to update company settings', 400));
  }
  const company = await Models.Company.findOne({
    where: {
      id: req.body.company_id
    },
    include: [
      {
        model: Models.EmailSender,
        // required: false,
        as: 'emailSenders',
      },
    ],
  });
  if (!company) {
    return next(new AppError('Company not found', 400));
  }

  if (req.user.roleType !== 'superuser' && req.user.company_id !== req.body.company_id) {
    return next(new AppError('You are not allowed to update company settings', 400));
  }

  if (!req.body.name) {
    return next(new AppError('Please Provide Company Name!', 400));
  }

  if (!req.body.industry_id) {
    return next(new AppError('Please Provide industry!', 400));
  }

  if (!req.body.country_code) {
    return next(new AppError('Please Provide Country code!', 400));
  }

  if (!req.body.twilio_phone) {
    return next(new AppError('Please Provide Twilio Phone!', 400));
  }

  if (!req.body.twilio_message_service_id) {
    return next(new AppError('Please Provide Twilio Message Service Id!', 400));
  }

  if (!req.body.twilio_twiml_app_id) {
    return next(new AppError('Please Provide Twilio TwiML App Id!', 400));
  }

  if (!req.body.twilio_api_key) {
    return next(new AppError('Please Provide Twilio API Key!', 400));
  }

  if (!req.body.twilio_api_secret) {
    return next(new AppError('Please Provide Twilio API Secret!', 400));
  }

  if (!req.body.twilio_account_sid) {
    return next(new AppError('Please Provide Twilio Account Sid!', 400));
  }

  if (!req.body.twilio_auth_token) {
    return next(new AppError('Please Provide Twilio Auth token!', 400));
  }

  if (!req.body.address) {
    return next(new AppError('Please Provide Address!', 400));
  }

  if (!req.body.city) {
    return next(new AppError('Please Provide City!', 400));
  }

  if (!req.body.zipCode) {
    return next(new AppError('Please Provide Zip Code!', 400));
  }

  if (!req.body.state) {
    return next(new AppError('Please Provide State!', 400));
  }

  if (!req.body.country) {
    return next(new AppError('Please Provide Country!', 400));
  }

  const update = await Models.Company.update(
    {
      name: req.body.name,
      industry_id: req.body.industry_id,
      country_code: req.body.country_code,
      twilio_message_service_id: req.body.twilio_message_service_id,
      twilio_twiml_app_id: req.body.twilio_twiml_app_id,
      twilio_api_key: req.body.twilio_api_key,
      twilio_api_secret: req.body.twilio_api_secret,
      twilio_account_sid: req.body.twilio_account_sid,
      twilio_auth_token: req.body.twilio_auth_token,
      twilio_phone: req.body.twilio_phone,
      address: req.body.address,
      city: req.body.city,
      zipCode: req.body.zipCode,
      state: req.body.state,
      country: req.body.country,
    },
    {
      where: {
        id: req.body.company_id,
      },
    },
  );

  if (!company.emailSenders.length) {
    await Models.EmailSender.create({
      id: uuidv4(),
      company_id: company.id,
      email: req.body.from_email,
    });
  } else {
    await Models.EmailSender.update({
      email: req.body.from_email,
    }, {
      where: {
        id: company.emailSenders[0].id
      },
    });
  }

  res.status(201).json({
    status: 'success',
  });
});

// SALES TEMPLATES ROUTES

const getCompanySalesTemplates = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  if (req.user.roleType !== 'superuser') {
    return next(new AppError('You do not have permission to access this page', 400));
  }
  const { page, count, filters } = req.query;
  const pageNumber = page && Utils.parseIntNumber(page.toString()) >= 0 ? Utils.parseIntNumber(page.toString()) : 0;
  const data = Utils.getPagination(pageNumber, count ? Utils.parseIntNumber(count.toString()) : 20);
  const filter = Utils.getQueryBuilder(filters);
  const filterWithCompany: any = { ...filter, company_id: req.user.company_id };
  if (req.query.type && req.query.type?.toString().toLowerCase() !== Constants.TYPE_ALL) {
    filterWithCompany.template_type = req.query.type;
  }
  const [templates, total] = await Promise.all([
    Models.SalesTemplate.findAll({
      where: filterWithCompany,
      limit: data.limit,
      offset: data.offset,
      // attributes: ['id', 'name', 'mobile'],
      order: [
        ['createdAt', 'desc'],
        [{ model: Models.SalesRecording, as: 'sales_recordings' }, 'createdAt', 'ASC'],
      ],
      include: [
        {
          model: Models.SalesRecording,
          required: false,
          as: 'sales_recordings',
          where: {
            is_deleted: false, // we only want to show recordings which are not deleted
          },
        },
      ],
    }),
    Models.SalesTemplate.count({
      where: filterWithCompany,
    }),
  ]);

  return res.status(200).json({ total, templates });
});

// this will upload the audio to aws s3 bucket
const uploadAudioToS3 = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const S3UploadPromise = util.promisify(AWSUtils.S3Utils.uploadAudioFiles);
    await S3UploadPromise(req, res);
    return res.status(200).send(
      _.map(req.files, (file: any) => ({
        name: file.originalname,
        url: file.location,
      })),
    );
  } catch (e) {
    if (typeof e === 'string') {
      return next(new AppError(e, 400));
    }
    return next(e);
  }
});

// this will return a template details
const getCompanySalesTemplateDetails = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.roleType !== 'superuser') {
      return next(new AppError('You do not have permission to access this page', 400));
    }
    const template = await Models.SalesTemplate.findOne({
      where: {
        id: req.params.id,
        company_id: req.user.company_id,
      },
      order: [
        [{ model: Models.SalesRecording, as: 'sales_recordings' }, 'createdAt', 'ASC'],
      ],
      include: [
        {
          model: Models.SalesRecording,
          required: false,
          as: 'sales_recordings',
          where: {
            is_deleted: false, // we only want to show recordings which are not deleted
          },
        },
      ],
    });

    return res.status(200).json({
      template,
    });
  } catch (e) {
    next(e);
  }
});

const updateCompanySalesTemplates = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    // if other then superuser is update the template, do not allow
    if (req.user.roleType !== 'superuser') {
      return next(new AppError('You do not have permission to edit sales templates', 400));
    }
    const template = await Models.SalesTemplate.findOne({
      where: {
        id: req.params.id,
      },
    });

    // if no template found
    if (!template) {
      return next(new AppError('Invalid template!', 400));
    }

    // we only allow company superuser to edit this template
    if (template.company_id !== req.user.company_id) {
      return next(new AppError('You do not have permission to edit this sales template!', 400));
    }

    // add validation checks
    if (!Utils.getTrim(req.body.template_name)) {
      return next(new AppError('Please provide a template name!', 400));
    }
    if (!Utils.getTrim(req.body.message)) {
      return next(new AppError('Please provide a template message!', 400));
    }

    if (Utils.isTemplateTypeEmail(req.body.template_type) && !Utils.getTrim(req.body.email_subject)) {
      return next(new AppError('Please provide a email subject!', 400));
    }

    if (!Utils.isValidTemplateType(req.body.template_type)) {
      return next(new AppError('Please provide a valid template type!', 400));
    }
    // update the template
    await Models.SalesTemplate.update(
      {
        template_name: req.body.template_name,
        message: req.body.message,
        email_subject: req.body.email_subject,
        updatedBy: req.user.id,
      },
      {
        where: {
          id: template.id,
        },
      },
    );

    // we have req.body.files
    // it contain both existing and new audio recording urls
    // now we only save the new recordings (create a recording row for template)
    // for others we only update isSelected value
    const recordingIds = _.map(req.body.files, 'id');
    if (recordingIds.length) {
      const existingRecordings = await Models.SalesRecording.findAll({
        where: {
          id: {
            [Op.in]: recordingIds,
          },
        },
      });

      // if recording file exists in already saved recordings, we will update it
      // otherwise we will create new recordings
      const recordingsToAdd = [...req.body.files];

      // get recordings which already exists
      const recordingsToUpdate = _.remove(recordingsToAdd, (rec) => _.find(existingRecordings, { id: rec.id }));
      await Promise.all([
        getAddRecordingPromise(recordingsToAdd, template),
        getUpdateRecordingPromise(recordingsToUpdate),
      ]);
    }
    return res.status(200).json({
      message: 'Sales template updated successfully',
      template,
    });
  } catch (e) {
    next(e);
  }
});

const addCompanySalesTemplates = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.roleType !== 'superuser') {
      return next(new AppError('You do not have permission to create sales templates', 400));
    }
    if (!Utils.getTrim(req.body.template_name)) {
      return next(new AppError('Please provide a template name!', 400));
    }
    if (Utils.isTemplateTypeEmail(req.body.template_type) && !Utils.getTrim(req.body.email_subject)) {
      return next(new AppError('Please provide a email subject!', 400));
    }
    if (!Utils.getTrim(req.body.message)) {
      return next(new AppError('Please provide a template message!', 400));
    }
    if (!Utils.isValidTemplateType(req.body.template_type)) {
      return next(new AppError('Please provide a valid template type!', 400));
    }

    // after validation we can create our sales template
    const template = await Models.SalesTemplate.create({
      id: uuidv4(),
      template_name: req.body.template_name,
      template_type: req.body.template_type, // or sms
      message: req.body.message,
      email_subject: req.body.email_subject,
      company_id: req.user.company_id,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    // now save recordings to template if any
    if (req.body.files && req.body.files.length) {
      const promise = getAddRecordingPromise(req.body.files, template);
      await Promise.all(promise);
    }

    return res.status(200).json({
      message: 'Sales template created successfully',
      template,
    });
  } catch (e) {
    next(e);
  }
});

const deleteAudioRecording = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.roleType !== 'superuser') {
      return next(new AppError('You do not have permission to perform this action', 400));
    }

    // delete a particulate recording
    await Models.SalesRecording.update(
      {
        is_deleted: true,
      },
      {
        where: {
          id: req.params.id,
        },
      },
    );

    return res.status(200).json({
      message: 'Recording deleted successfully',
    });
  } catch (e) {
    next(e);
  }
});


export default {
  getCompanyDetails,
  updateCompanySettings,
  getCompanySalesTemplates,
  uploadAudioToS3,
  getCompanySalesTemplateDetails,
  updateCompanySalesTemplates,
  addCompanySalesTemplates,
  deleteAudioRecording,
}