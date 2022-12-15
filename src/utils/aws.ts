import * as aws from 'aws-sdk';
import _ = require('lodash');
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as path from 'path';
import { AudienceCustomerInput } from '../db/models/audience_customer';
import { SalesTemplateInput } from '../db/models/salestemplates';
import { encodeBase64, updateTagsToCustomerValue } from './common';
import { getBasicEmailContent } from './email-template';
import { Config } from '../utils/config'

// update AWS Keys
aws.config.update({
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_DEFAULT_REGION,
});

// create a new S3 object
const s3 = new aws.S3();

// function to upload file to S3 via multer
const uploadAudioFiles = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_RECORDINGS_BUCKET,
    key: (req: any, file: any, cb: any) => {
      cb(null, `${file.originalname}.mp3`); // use Date.now() for unique file keys
    },
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  // Limit file to max 1mb
  limits: { fileSize: 1024 * 1024 * 1 }, // 1mb max file

  // FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
  fileFilter: (req: any, file: any, cb: any) => {
    const filetypes = /audio/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb('Error: Allowed audio only of extensions mp3 !');
  },
}).array('audioFiles', 5);

const sendEmailForCampaign = async (params: any) => {
  const ses = new aws.SES();
  return Promise.all(params.map((param: any) => {
    return ses.sendEmail(param).promise().then((res) => {
      return res;
    }).catch((err: any) => {
      // we dont throw err, we just return it
      return err;
    });
  }));
}

const createIdentity = async (params: any) => {
  const ses = new aws.SES();
  const d = await ses.getIdentityVerificationAttributes({
    Identities: ['digitalmarketingworld.com.au']
  }).promise();
  // const a = await ses.identity.promise();
  console.log(d);
}

const sendEmail = async (params: any) => {
  return new aws.SES().sendEmail(params).promise().then((res) => {
    console.log(res);
    return Promise.resolve();
  }).catch(err => {
    console.log(err);
    return Promise.reject(err);
  });
}

const getParamsForCampaign = (audiences: AudienceCustomerInput[], template: SalesTemplateInput, from: string, companyId: string) => {
  return _.map(audiences, audience => {
    const body = updateTagsToCustomerValue(template.message, audience.customer);
    const subject = updateTagsToCustomerValue(template.email_subject, audience.customer);
    return {
      Source: from,
      Destination: {
        ToAddresses: [audience.customer.email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: getBasicEmailContent({
              body,
              unsubscribeLink: `${Config.backendURL}/email/unsubsribe?co=${encodeBase64(companyId)}&cu=${encodeBase64(audience.customer.id)}`,
            }),
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        }
      }
    };
  });
};

export default {
  aws,
  s3: new aws.S3(),
  S3Utils: {
    uploadAudioFiles,
  },
  emailUtils: {
    sendEmail,
    sendEmailForCampaign,
    getParamsForCampaign,
    createIdentity,
  }
};
