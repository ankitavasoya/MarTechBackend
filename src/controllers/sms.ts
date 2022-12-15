import { Twilio, jwt, twiml } from 'twilio';
import { where, fn, col, Op } from 'sequelize';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Response } from 'express';


import { Models } from '../db/models';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import * as Utils from '../utils/common';
import callLogsController from './callLogsController';
import * as Constants from '../utils/constants';
import { AppRequest } from '../utils/interface';
import { ReceivingCall } from '../db/models/user';


const { AccessToken } = jwt;
const { VoiceGrant } = AccessToken;
const { VoiceResponse } = twiml;

const sendSMS = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.body.to_customer_id || !req.user.id) {
      return next(new AppError('Invalid params', 400));
    }
    const client = new Twilio(req.user.companyInfo.twilio_account_sid, req.user.companyInfo.twilio_auth_token);
    const toCustomerIdd = req.body.to_customer_id;
    const userId = req.user.id;

    const customer = await Models.Customer.findOne({
      where: { id: toCustomerIdd },
      attributes: ['id', 'country_code', 'mobile', 'full_mobile'],
    });

    if (!customer) {
      return next(new AppError('Invalid user', 400));
    }

    let fromNumber;
    if (Utils.Role.isSuperUserOrManagement(req.user)) {
      fromNumber = req.user.companyInfo.full_twilio_phone;
    } else {
      fromNumber = req.user.full_twilio_phone
    }

    if (!fromNumber) {
      return next(new AppError(
        `Please specify a mobile number in ${Utils.Role.isSuperUserOrManagement(req.user) ? 'company' : 'user'} settings`,
        400,
      ));
    }

    const sms = await client.messages.create({
      body: req.body.msg,
      to: customer.full_mobile,
      from: fromNumber,
    });

    await Models.Message.create({
      id: uuidv4(),
      from: fromNumber,
      to: customer.full_mobile,
      to_customer_id: customer.id,
      user_id: userId,
      company_id: Utils.Role.isSuperUserOrManagement(req.user) ? req.user.company_id : null,
      msg: req.body.msg,
    });

    return res.status(200).json({
      status: 'success',
    });
  } catch (e) {
    return next(e);
  }
};

const receiveSMS = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  // save reponse as well
  if (req.body.From && req.body.Body && req.body.To && req.params.id) {
    // we will fetch customer, company and user
    // from customer we will get customer id
    // from company, user we will get company_id and user_id to save into message table
    const [user, company, customer] = await Promise.all([
      Models.User.findOne({
        where: where(fn('CONCAT', col('twilio_country_code'), col('twilio_phone')), Op.eq, req.body.To),
        attributes: ['id'],
        raw: true,
      }),
      Models.Company.findOne({
        where: where(fn('CONCAT', col('country_code'), col('twilio_phone')), Op.eq, req.body.To),
        attributes: ['id'],
        raw: true,
      }),
      Models.Customer.findOne({
        where: {
          [Op.and]: [
            where(fn('CONCAT', col('country_code'), col('mobile')), Op.eq, req.body.From),
            {
              company_id: req.params.id,
            }
          ]
        },
        attributes: ['id'],
        raw: true,
      }),
    ]);


    if (!customer) {
      return res.status(204).json({
        status: 'success',
      });
    }

    // prepare data object to save
    const smsObject: any = {
      id: uuidv4(),
      from: req.body.From,
      to: req.body.To,
      msg: req.body.Body,
      from_customer_id: customer.id,
    };

    // we also store companyId or user_id
    // priority is companyId and then user_id
    if (company) {
      smsObject.company_id = company.id;
    } else if (user) {
      smsObject.user_id = user.id;
    }
    if (company && customer && _.includes(Constants.OPT_OUT_KEYWORDS, req.body.Body?.trim().toLowerCase())) {
      // if customer replied to company number, they can optout
      await Models.Customer.update({
        is_optout_from_campaign: true,
      }, {
        where: {
          id: customer.id,
        },
      });
    }
    await Models.Message.create(smsObject);
  }
  return res.status(200).json({
    status: 'success',
  });
});

const getAllmessages = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  const messages = await Models.Message.findAll({});

  if (!messages) {
    return next(new AppError('No messages found.', 404));
  }

  return res.status(200).json({
    status: 'success',
    messages,
  });
});

const generateToken = async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.user;
    let token = '';
    if (req.user.companyInfo.twilio_account_sid && req.user.companyInfo.twilio_api_key && req.user.companyInfo.twilio_api_secret) {
      const accessToken = new AccessToken(
        req.user.companyInfo.twilio_account_sid,
        req.user.companyInfo.twilio_api_key,
        req.user.companyInfo.twilio_api_secret,
      );
      accessToken.identity = id;

      const grant = new VoiceGrant({
        outgoingApplicationSid: req.user.companyInfo.twilio_twiml_app_id,
        incomingAllow: true,
      });
      accessToken.addGrant(grant);
      token = accessToken.toJwt();
    }
    return res.status(200).send({
      token,
    });
  } catch (e) {
    return next(e);
  }
};

const saveIncomingCallLog = async (from: any, to: any, company: any) => {
  try {
    const [customer] = await Promise.all([
      Models.Customer.findOne({
        where: where(fn('CONCAT', col('country_code'), col('mobile')), Op.eq, from),
        attributes: ['id'],
        raw: true,
      }),
    ]);
    if (customer && company) {
      // we can send sms to user also here
      await callLogsController.addLog({
        log_description: 'Incoming call.',
        customer_id: customer.id,
        company_id: company.id,
      });
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const voiceResponse = async (req: AppRequest, res: Response, next: NextFunction) => {
  const toNumberOrClientName = req.body.To;

  const twiml = new VoiceResponse();
  let dial: any;
  // If the request to the /voice endpoint is TO your Twilio Number,
  // then it is an incoming call towards your Twilio.Device.
  const fromClient = _.split(req.body.From, ':');
  const userId = fromClient.length ? fromClient[1] : null;
  // userId will be null if its an incoming call
  // and fromUser will also be null
  if (req.body.To) {
    const [toCompany, fromUser] = await Promise.all([
      Models.Company.findOne({
        where: where(fn('CONCAT', col('country_code'), col('twilio_phone')), Op.eq, req.body.To),
        attributes: ['id'],
        raw: true,
      }),
      userId ? Models.User.findOne({
        where: {
          id: userId,
        },
        include: [
          {
            required: false,
            model: Models.Company,
            as: 'companyInfo',
          },
        ],
      }) : null,
    ]);
    if (toCompany) {
      // find available user (sales rep) and call their phone
      const users = await Models.User.findAll({
        where: {
          roleType: Constants.ALL_ROLES.SALES_REP,
          company_id: toCompany.id,
        },
        attributes: ['id', 'mobile_country_code', 'mobile_phone', 'full_mobile_phone'],
      });

      dial = twiml.dial();

      // rightnow we are notifing all sales rep
      // but infuture we will notify only them who are online
      _.forEach(users, (user) => dial.client(user.id));

      saveIncomingCallLog(req.body.From, req.body.To, toCompany);
    } else if (fromUser) {
      const fromNumber = fromUser.companyInfo.full_twilio_phone;

      if (!fromNumber) {
        return next(new AppError(
          `Please specify a mobile number in ${Utils.Role.isSuperUserOrManagement(fromUser) ? 'company' : 'user'} settings`,
          400,
        ));
      }
      dial = twiml.dial({
        callerId: fromNumber,
      });
      dial.number(toNumberOrClientName);
    }
  } else {
    twiml.say('Thanks for calling!');
  }
  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
};

const dtmfResponse = async (req: AppRequest, res: Response, next: NextFunction) => {
  // const toNumberOrClientName = req.body.To;
  const twiml = new VoiceResponse();
  console.log(req.body);
  console.log(req.query);
  if (req.query.companyId && req.query.customerId) {
    // const customer = await Models.Customer.findOne({
    //   where: {
    //     id: req.query.customerId,
    //     company_id: req.query.companyId,
    //   },
    //   attributes: ['id'],
    //   raw: true,
    // });
    if (req.body.Digits === '1') {
      // redirect to sales rep of the company
      twiml.say('Redirecting you to sales rep, please wait..');
      const salesRep = await Models.User.findOne({
        where: {
          company_id: req.query.companyId,
          is_active: true,
          is_available: true,
          roleType: Constants.ALL_ROLES.SALES_REP, // sales rep
          receiving_call: {
            [Op.or]: {
              [Op.ne]: null,
              [Op.ne]: '',
            },
          }
        },
        order: [
          ['updatedAt', 'desc'],
        ],
      });
      if (salesRep) {
        const dial = twiml.dial();
        if (salesRep.receiving_call === ReceivingCall.TWILIO) {
          dial.client(salesRep.id);
        } else if (salesRep.receiving_call === ReceivingCall.MOBILE) {
          dial.number(salesRep.full_mobile_phone);
        }
      } else {
        twiml.say('No sales rep available, please try later');
      }
    } else if (req.body.Digits === '2') {
      // if customer replied 2, it means they dont want calls now
      await Models.Customer.update({
        is_optout_from_campaign: true,
      }, {
        where: {
          id: req.query.customerId,
        },
      });
      twiml.say('You have optout from receiving calls from us.');
    }
  }

  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
};

export default {
  sendSMS,
  getAllmessages,
  receiveSMS,
  voiceResponse,
  generateToken,
  dtmfResponse,
}