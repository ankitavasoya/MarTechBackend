import { v4 as uuidv4 } from 'uuid';
import {
  where, fn, col, Op, LogicType, Sequelize
} from 'sequelize';
import { NextFunction, Response } from 'express';

import { Models } from '../db/models';
import catchAsync from '../utils/catchAsync';
import * as Utils from '../utils/common';
import { AppRequest } from '../utils/interface';

const addLog = async (payload: any) => {
  const data = await Models.CallLogs.create({
    id: uuidv4(),
    log_description: payload.log_description,
    customer_id: payload.customer_id,
    user_id: payload.user_id,
    company_id: payload.company_id,
  });
  return data;
};

const addLogRoute = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const payload = req.body;
    if (
      payload.extra &&
      payload.extra.mobile &&
      !payload.extra.notSave &&
      payload.log_description
    ) {
      const customer = await Models.Customer.findOne({
        where: where(fn('CONCAT', col('country_code'), col('mobile')), Op.eq, payload.extra.mobile),
        attributes: ['id'],
        raw: true,
      });
      if (!customer) {
        return res.status(200).json({});
      }
      await addLog({
        id: uuidv4(),
        log_description: req.body.log_description,
        customer_id: customer.id,
        user_id: req.user.id,
        company_id: Utils.Role.isSuperUserOrManagement(req.user) ? req.user.company_id : null,
      });
      return res.status(200).json({});
    }
    return res.status(200).json({});
  } catch (e) {
    return next(e);
  }
});

export default {
  addLog,
  addLogRoute
}