import { v4 as uuidv4 } from 'uuid';
import { NextFunction, Response } from 'express';
import * as _ from 'lodash';

import catchAsync from '../utils/catchAsync';
import { Models } from '../db/models';
import AppError from '../utils/appError';
import * as Utils from '../utils/common';
import { AppRequest } from '../utils/interface';

const getTagsList = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  const { page, count, filters } = req.query;
  const pageNumber = page && Utils.parseIntNumber(page.toString()) >= 0 ? Utils.parseIntNumber(page.toString()) : 0;
  const data = Utils.getPagination(pageNumber, count ? Utils.parseIntNumber(count.toString()) : 20);
  const filter = Utils.getQueryBuilder(filters);
  const filterWithCompany = { ...filter, company_id: req.user.company_id };
  const [tags, total] = await Promise.all([
    Models.CustomerTag.findAll({
      where: filterWithCompany,
      limit: data.limit,
      offset: data.offset,
      order: [
        ['createdAt', 'desc'],
      ],
    }),
    Models.CustomerTag.count({
      where: filterWithCompany,
    }),
  ]);
  return res.status(200).json({ total, tags });
});

const addTag = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    // validate tags
    if (!Utils.getTrim(req.body.tag_name)) {
      return next(new AppError('Please provide a tag name!', 400));
    }

    // after validation we can create our tag
    const tag = await Models.CustomerTag.create({
      id: uuidv4(),
      tag_name: req.body.tag_name.trim(),
      company_id: req.user.company_id,
    });

    return res.status(200).json({
      tag
    });
  } catch (e) {
    next(e);
  }
});


const editTag = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    // validate tags
    if (!Utils.getTrim(req.body.tag_name)) {
      return next(new AppError('Please provide a tag name!', 400));
    }

    const tag = await Models.CustomerTag.findOne({
      where: {
        id: req.params.id,
      },
    });

    // if no tag gound
    if (!tag) {
      return next(new AppError('Invalid tag!', 400));
    }

    // we only allow company superuser to edit this template
    if (tag.company_id !== req.user.company_id) {
      return next(new AppError('You do not have permission to edit this tag!', 400));
    }

    // after validation we can create our tag
    await Models.CustomerTag.update(
      {
        tag_name: req.body.tag_name,
      },
      {
        where: {
          id: tag.id,
        },
      },
    );

    return res.status(200).json({});
  } catch (e) {
    next(e);
  }
});

export const TagsController = {
  getTagsList,
  addTag,
  editTag,
}