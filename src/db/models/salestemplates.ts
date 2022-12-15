import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface SalesTemplateAttributes {
  id?: string,
  template_name: string,
  template_type: string,
  message: string,
  email_subject?: string,
  company_id: string,
  createdBy: string,
  updatedBy: string,
}

export enum TemplateType {
  SMS = 'sms',
  SALES_BRIDGE = 'sales_bridge',
  EMAIL = 'email',
}

export interface SalesTemplateInput extends Optional<SalesTemplateAttributes, 'id'> { }
export interface SalesTemplateOuput extends Required<SalesTemplateInput> { }

class SalesTemplate extends Model<SalesTemplateAttributes, SalesTemplateInput> implements SalesTemplateAttributes {
  public id!: string;
  public template_name!: string;
  public template_type!: string;
  public message!: string;
  public company_id!: string;
  public email_subject!: string;
  public createdBy!: string;
  public updatedBy!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SalesTemplate.init(
  {
    template_name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    template_type: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    message: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    email_subject: {
      type: DataTypes.STRING,
    },
    company_id: {
      allowNull: false,
      type: DataTypes.UUID,
    },
    createdBy: {
      allowNull: false,
      type: DataTypes.UUID,
    },
    updatedBy: {
      allowNull: false,
      type: DataTypes.UUID,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'SalesTemplates',
    tableName: 'sales_templates',
  },
);

export default SalesTemplate;
