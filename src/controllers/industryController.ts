import { NextFunction, Response } from 'express';
import { AppRequest } from '../utils/interface';

import { Models } from '../db/models';
import catchAsync from '../utils/catchAsync';

const listIndustries = catchAsync(async (req: AppRequest, res: Response) => {
  const [industries, total] = await Promise.all([
    Models.Industry.findAll({}),
    Models.Industry.count({}),
  ]);
  return res.status(200).json({ total, industries });
});

export default {
  listIndustries,
}