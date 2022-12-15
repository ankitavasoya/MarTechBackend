import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import * as Constants from '../../utils/constants';
import Company from './company';

export enum ReceivingCall {
  TWILIO = 'twilio',
  MOBILE = 'mobile',
  NONE = '',
}
interface UserAttributes {
  id?: string,
  name: string,
  email: string,
  twilio_country_code?: string,
  twilio_phone?: string,
  full_twilio_phone?: string,
  mobile_country_code?: string,
  mobile_phone?: string,
  full_mobile_phone?: string,
  password: string,
  is_active?: boolean,
  company_id: string,
  roleType: string,
  receiving_call: ReceivingCall;
  is_available?: boolean;

  // relations
  readonly companyInfo?: Company;
}

export interface UserInput extends Optional<UserAttributes, 'id'> { }
export interface UserOuput extends Required<UserInput> { }

class User extends Model<UserAttributes, UserInput> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public twilio_country_code!: string;
  public twilio_phone!: string;
  public full_twilio_phone!: string;
  public mobile_country_code!: string;
  public mobile_phone!: string;
  public full_mobile_phone!: string;
  public password!: string;
  public is_active!: boolean;
  public receiving_call!: ReceivingCall;
  public is_available!: boolean;
  public company_id!: string;
  public roleType!: string;

  // relations
  public readonly companyInfo?: Company;


  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[A-Za-z ]+$/
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'email',
        msg: 'Please this email is already used, Provide another email!',
      },
      validate: {
        isEmail: {
          msg: 'Please provide a valid email!'
        }
      },
    },
    twilio_country_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twilio_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    full_twilio_phone: {
      type: DataTypes.VIRTUAL,
      get() {
        const data = [];
        if (this.twilio_country_code) {
          data.push(this.twilio_country_code);
        }
        if (this.twilio_phone) {
          data.push(this.twilio_phone);
        }
        return data.join('');
      },
    },
    mobile_country_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    full_mobile_phone: {
      type: DataTypes.VIRTUAL,
      get() {
        const data = [];
        if (this.mobile_country_code) {
          data.push(this.mobile_country_code);
        }
        if (this.mobile_phone) {
          data.push(this.mobile_phone);
        }
        return data.join('');
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    receiving_call: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    company_id: {
      type: DataTypes.UUID,
    },
    roleType: {
      type: DataTypes.ENUM,
      values: Constants.ALL_ROLES_ARRAY,
      allowNull: false,
      defaultValue: 'none',
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'User',
    tableName: 'users',
  },
);

export default User;