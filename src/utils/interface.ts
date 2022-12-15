import { Request } from 'express';
import { UserInput } from '../db/models/user';

export interface AppRequest extends Request {
  user: UserInput // or any other type
}
