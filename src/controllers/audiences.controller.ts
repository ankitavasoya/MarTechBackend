import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Response } from 'express';
import * as _ from 'lodash';
import { Sequelize } from 'sequelize';

import catchAsync from '../utils/catchAsync';
import { Models } from '../db/models';
import AppError from '../utils/appError';
import * as Utils from '../utils/common';
import * as Constants from '../utils/constants';
import { AppRequest } from '../utils/interface';
import AudienceBatchQueue from '../bull-queue/queues/audience-batch.queue';
import { JOB_NAMES } from '../bull-queue/helpers/constants';

const getAudienceList = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  if (req.user.roleType !== 'superuser') {
    return next(new AppError('You do not have permission to access this page', 400));
  }
  const { page, count, filters } = req.query;
  const pageNumber = page && Utils.parseIntNumber(page.toString()) >= 0 ? Utils.parseIntNumber(page.toString()) : 0;
  const data = Utils.getPagination(pageNumber, count ? Utils.parseIntNumber(count.toString()) : 20);
  const filter = Utils.getQueryBuilder(filters);
  const filterWithCompany = { ...filter, company_id: req.user.company_id };
  const [audiences, total] = await Promise.all([
    Models.Audience.findAll({
      where: filterWithCompany,
      limit: data.limit,
      offset: data.offset,
      order: [
        ['createdAt', 'desc'],
      ],
      // we need to get total count for audience customers
      attributes: ['*', [
        Sequelize.fn('COUNT', Sequelize.col('audiencesCustomers.audience_id')),
        'audiencesCustomers'
      ]],
      include: [
        {
          // we need audience customer count so we include that model
          duplicating: false,
          model: Models.AudienceCustomer,
          attributes: [],
          as: 'audiencesCustomers',
          // we also include customer because we only want active customers
          include: [{
            model: Models.Customer,
            attributes: [],
            as: 'customer',
            where: {
              is_deleted: false,
            }
          }]
        }
      ],
      group: ['Audience.id'],
      raw: true,
    }),
    Models.Audience.count({
      where: filterWithCompany,
    }),
  ]);
  return res.status(200).json({ total, audiences });
});

const addAudienceList = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user.roleType !== 'superuser') {
      return next(new AppError('You do not have permission to create audience list', 400));
    }
    if (!Utils.getTrim(req.body.audience_name)) {
      return next(new AppError('Please provide a audience name!', 400));
    }
    // uncomment this when we have filters
    // if (!_.keys(req.body.filters).length) {
    //   return next(new AppError('Please provide filters!', 400));
    // }

    // after validation we can create our audience list
    const audience = await Models.Audience.create({
      id: uuidv4(),
      audience_name: req.body.audience_name,
      company_id: req.user.company_id,
      status: Constants.AUDIENCE_STATUS.ACTIVE,
      creation_status: Constants.AUDIENCE_CREATION_STATUS.INPROGRESS,
      last_sync_at: new Date().toISOString(),
      filters: req.body.filters || {},
    });

    // process saving audience in queue
    AudienceBatchQueue.add(JOB_NAMES.AUDIENCE.PROCESS_AUDIENCE_ALL, {
      audience,
      filters: req.body.filters,
      companyId: req.user.company_id,
    });

    return res.status(200).json({
      audience,
    });
  } catch (e) {
    next(e);
  }
});

const getAudienceDetail = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const audience = await Models.Audience.findOne({
    where: { id },
  });
  return res.status(200).json(audience);
});

export default {
  getAudienceList,
  getAudienceDetail,
  addAudienceList
}