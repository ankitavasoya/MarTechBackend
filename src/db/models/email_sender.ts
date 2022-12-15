import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface EmailSenderAttributes {
  id?: string,
  email: string,
  company_id: string,
}

export enum TemplateType {
  SMS = 'sms',
  SALES_BRIDGE = 'sales_bridge',
  EMAIL = 'email',
}

export interface EmailSenderInput extends Optional<EmailSenderAttributes, 'id'> { }
export interface EmailSenderOuput extends Required<EmailSenderInput> { }

class EmailSender extends Model<EmailSenderAttributes, EmailSenderInput> implements EmailSenderAttributes {
  public id!: string;
  public company_id!: string;
  public email!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmailSender.init(
  {
    email: {
      type: DataTypes.STRING,
    },
    company_id: {
      allowNull: false,
      type: DataTypes.UUID,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'EmailSenders',
    tableName: 'email_senders',
  },
);

export default EmailSender;
