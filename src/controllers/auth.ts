import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { Response, NextFunction } from 'express';

import { Models } from '../db/models';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import * as Utils from '../utils/common';
import { AppRequest } from '../utils/interface';
import { ReceivingCall } from '../db/models/user';

const signToken = (user: any) => jwt.sign(
  {
    payload: {
      id: user.id,
      nom: user.name,
      email: user.email,
    },
  },
  process.env.JWT_SECRET,
  {
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
);

const protect = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged In ! Please log in to get access.', 401),
    );
  }

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

  const freshUser = await Models.User.findByPk(decoded.payload.id);

  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token does not exist.', 401),
    );
  }

  req.user = freshUser;

  next();
});

const restrictTo = (...roles: any[]) => (req: AppRequest, res: Response, next: NextFunction) => {
  if (!roles.includes(req.user.roleType)) {
    return next(
      new AppError('You do not have permission to perform this action', 403),
    );
  }
  next();
};

const login = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email) {
    return next(new AppError('Please provide a email!', 400));
  }
  if (!password) {
    return next(new AppError('Please provide a password!', 400));
  }

  const user = await Models.User.findOne({
    where: { email },
    include: { model: Models.Company, as: 'companyInfo' },
  });

  if (!user) {
    return next(new AppError('Incorrect email! please try again.', 401));
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect password! please try again.', 401));
  }

  const userInfo = {
    id: user.id,
    name: user.name,
    email: user.email,
    company: user.companyInfo ? user.companyInfo.name : '',
  };

  const token = signToken(userInfo);

  res.status(200).json({
    status: 'success',
    token,
  });
});

const signup = catchAsync(async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.body.name) {
      return next(new AppError('Please Provide Your Full Name!', 401));
    }

    if (!req.body.email) {
      return next(new AppError('Please Provide your email!', 401));
    }

    if (!req.body.company) {
      return next(new AppError('Please Provide your company!', 401));
    }

    if (!req.body.password) {
      return next(new AppError('Please Provide your password!', 401));
    }

    if (
      !req.body.passwordConfirm ||
      req.body.passwordConfirm !== req.body.password
    ) {
      return next(new AppError('Please confirm your password!', 401));
    }

    const password = await bcrypt.hash(req.body.password, 12);
    req.body.password = password;

    let company = await Models.Company.findOne({
      where: { name: Utils.getTrimAndLowerCase(req.body.company) },
    });

    if (!company) {
      company = await Models.Company.create({
        id: uuidv4(),
        name: Utils.getTrimAndLowerCase(req.body.company),
        address: Utils.getTrimAndLowerCase(req.body.address),
        city: Utils.getTrimAndLowerCase(req.body.city),
        zipCode: req.body.zipCode,
      });
    }

    // create company user, note that company user is always superuser
    const newUser = await Models.User.create({
      id: uuidv4(),
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      roleType: 'superuser',
      company_id: company.id,
      receiving_call: ReceivingCall.NONE,
    });

    if (!newUser) {
      return next(new AppError('Invalid fields or duplicate user', 401));
    }

    res.status(201).json({
      status: 'success',
      user: newUser.id,
    });
  } catch (e) {
    res.status(400).json({
      status: 'false',
      error: e.message,
    });
  }
});


export default {
  protect,
  restrictTo,
  login,
  signup,
}