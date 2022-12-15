import * as jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';

import { Models } from '../db/models';
import AppError from '../utils/appError';

import { AppRequest } from '../utils/interface';

export default async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'].toString();
    }
    if (!token) {
      return next(
        new AppError('You are not logged In ! Please log in to get access.', 401),
      );
    }
    // verify that the token was signed by our server secret jet
    jwt.verify(token, process.env.JWT_SECRET);
    const decoded: any = jwt.decode(token); // decode the token
    const user = await Models.User.findOne({
      where: {
        id: decoded.payload.id,
      },
      include: [
        {
          required: false,
          model: Models.Company,
          as: 'companyInfo',
        },
      ],
    });
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Unauthorized',
      });
    }
    req.user = user;
    return next(); // move to the next function
  } catch (e) {
    return res.status(401).json({
      error: true,
      message: 'Unauthorized',
    });
  }
};
