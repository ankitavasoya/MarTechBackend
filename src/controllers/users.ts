import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { NextFunction, Response } from 'express';
import * as _ from 'lodash';

import { Models } from '../db/models';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import * as Utils from '../utils/common';
import { AppRequest } from '../utils/interface';
import { ReceivingCall } from '../db/models/user';

const getAllUsers = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  if (req.user.roleType !== 'superuser') {
    return next(new AppError('You are not allowed to see users', 400));
  }

  // extract the page and number of element per page, driver and name filter from the url
  const { page, count, filters } = req.query as any;
  const pageNumber = page && parseInt(page, 10) >= 0 ? parseInt(page, 10) : 0;
  const data = Utils.getPagination(pageNumber, count ? parseInt(count, 10) : 20);
  const filterCustomer = Utils.getQueryBuilder(filters);
  const [users, total] = await Promise.all([
    Models.User.findAll({
      where: { ...filterCustomer, company_id: req.user.company_id },
      limit: data.limit,
      offset: data.offset,
      attributes: [
        'id',
        'name',
        'is_active',
        'roleType',
        'createdAt',
        'email',
        'twilio_phone',
        'mobile_phone',
        'twilio_country_code',
        'mobile_country_code',
        'is_available',
        'receiving_call'
      ],
      order: [['createdAt', 'desc']],
      include: [
        {
          model: Models.Company,
          as: 'companyInfo',
        },
      ],
    }),
    Models.User.count({
      where: { ...filterCustomer, company_id: req.user.company_id },
    }),
  ]);
  return res.status(200).json({ total, users });
});

const updateUser = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  if (req.user.roleType !== 'superuser') {
    return next(new AppError('You are not allowed to update user', 400));
  }

  if (req.body.receiving_call && !_.includes(_.values(ReceivingCall), req.body.receiving_call)) {
    return next(new AppError('Pleace enter valid receiving call value!', 400));
  }
  // create update object for user
  const userObject: any = {
    name: req.body.name,
    email: req.body.email,
    is_active: req.body.is_active,
    roleType: req.body.roleType,
    twilio_phone: req.body.twilio_phone,
    mobile_phone: req.body.mobile_phone,
    twilio_country_code: req.body.twilio_country_code,
    mobile_country_code: req.body.mobile_country_code,
    receiving_call: req.body.receiving_call,
  };

  if (req.body.password && req.body.password.trim() !== '') {
    if (req.body.password !== req.body.confirmPassword) {
      return next(new AppError('Pleace confirm the password !', 400));
    }

    const password = await bcrypt.hash(req.body.password, 12);
    // add password to update object
    userObject.password = password;

    delete req.body.confirmPassword;
  } else {
    delete req.body.password;
    delete req.body.confirmPassword;
  }

  // save user data
  const user = await Models.User.update(userObject, {
    where: { id: req.params.id },
  });

  if (!user) {
    return next(
      new AppError('Invalid fields or No user found with this ID', 404),
    );
  }

  res.status(203).json({
    status: 'success',
  });
});

const addUser = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  if (req.user.roleType !== 'superuser') {
    return next(new AppError('You are not allowed to create user', 400));
  }

  if (!req.body.name) {
    return next(new AppError('Please Provide Your Full Name!', 400));
  }

  if (!req.body.email) {
    return next(new AppError('Please Provide your email!', 400));
  }

  if (!req.body.roleType) {
    return next(new AppError('Please select a role!', 400));
  }

  if (!req.body.password) {
    return next(new AppError('Please Provide your password!', 400));
  }

  if (
    !req.body.confirmPassword ||
    req.body.confirmPassword !== req.body.password
  ) {
    return next(new AppError('Please confirm your password!', 400));
  }

  if (req.body.receiving_call && !_.includes(_.values(ReceivingCall), req.body.receiving_call)) {
    return next(new AppError('Pleace enter valid receiving call value!', 400));
  }

  delete req.body.confirmPassword;

  const password = await bcrypt.hash(req.body.password, 12);
  req.body.password = password;

  const newUser = await Models.User.create({
    id: uuidv4(),
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    is_active: req.body.is_active || false,
    twilio_phone: req.body.twilio_phone,
    mobile_phone: req.body.mobile_phone,
    twilio_country_code: req.body.twilio_country_code,
    mobile_country_code: req.body.mobile_country_code,
    company_id: req.user.company_id,
    roleType: req.body.roleType,
    receiving_call: req.body.receiving_call,
  });

  if (!newUser) {
    return next(new AppError('Invalid fields or duplicate user', 400));
  }

  res.status(201).json({
    status: 'success',
  });
});

const patchUser = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  if (req.user.roleType !== 'superuser') {
    return next(new AppError('You are not allowed to update user', 400));
  }

  // create update object for user
  const userObject: any = {};

  if (_.has(req.body, 'is_available')) {
    userObject.is_available = req.body.is_available === true;
  }

  if (_.keys(userObject).length) {
    // save user data
    const user = await Models.User.update(userObject, {
      where: { id: req.params.id },
    });

    if (!user) {
      return next(
        new AppError('Invalid fields or No user found with this ID', 400),
      );
    }

    await Models.User.update(
      userObject,
      {
        where: {
          id: req.params.id,
        },
      },
    );
    res.status(201).json({
      status: 'success',
    });
  }
});

const getCurrentUser = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  res.status(203).json({
    status: 'success',
    user: req.user
  });
});

export default {
  addUser,
  getAllUsers,
  updateUser,
  patchUser,
  getCurrentUser
}