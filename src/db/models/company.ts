import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import EmailSender from './email_sender';
import Industry from './industry';
import User from './user';

interface CompanyAttributes {
  id?: string,
  name: string,
  address: string,
  city: string,
  zipCode: number,
  longitude?: number,
  latitude?: number,
  twilio_phone?: string,
  country_code?: string,
  full_twilio_phone?: string,
  twilio_message_service_id?: string,
  twilio_twiml_app_id?: string,
  twilio_api_key?: string;
  twilio_api_secret?: string;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  state?: string,
  country?: string,
  industry_id?: string,

  // relations
  readonly emailSenders?: EmailSender[];
}

export interface CompanyInput extends Optional<CompanyAttributes, 'id'> { }
export interface CompanyOuput extends Required<CompanyInput> { }

class Company extends Model<CompanyAttributes, CompanyInput> implements CompanyAttributes {
  public id!: string;
  public name!: string;
  public address!: string;
  public city!: string;
  public zipCode!: number;
  public longitude!: number;
  public latitude!: number;
  public twilio_phone!: string;
  public country_code!: string;
  public full_twilio_phone!: string;
  public twilio_message_service_id!: string;
  public twilio_twiml_app_id!: string;
  public twilio_api_key!: string;
  public twilio_api_secret!: string;
  public twilio_account_sid!: string;
  public twilio_auth_token!: string;
  public state!: string;
  public country!: string;
  public industry_id!: string;

  // relations
  public readonly emailSenders?: EmailSender[];

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'name',
        msg: 'Company name is taken!',
      },
    },
    address: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    twilio_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    full_twilio_phone: {
      type: DataTypes.VIRTUAL,
      get() {
        const data = [];
        if (this.country_code) {
          data.push(this.country_code);
        }
        if (this.twilio_phone) {
          data.push(this.twilio_phone);
        }
        return data.join('');
      },
    },
    twilio_message_service_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twilio_twiml_app_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    twilio_api_key: {
      type: DataTypes.STRING,
    },
    twilio_api_secret: {
      type: DataTypes.STRING,
    },
    twilio_account_sid: {
      type: DataTypes.STRING,
    },
    twilio_auth_token: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    industry_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Company',
    tableName: 'companys',
  },
);

export default Company;