import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import * as Constants from '../../utils/constants';

interface AudienceAttributes {
  id?: string,
  audience_name: string,
  status: string,
  creation_status: string,
  last_sync_at: string,
  filters: any,
  company_id: string,
}

export interface AudienceInput extends Optional<AudienceAttributes, 'id'> { }
export interface AudienceOuput extends Required<AudienceInput> { }

class Audience extends Model<AudienceAttributes, AudienceInput> implements AudienceAttributes {
  public id!: string;
  public audience_name!: string;
  public status!: string;
  public creation_status!: string;
  public last_sync_at!: string;
  public filters!: any;
  public company_id!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Audience.init(
  {
    audience_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: Constants.AUDIENCE_STATUS_ARRAY,
      allowNull: false,
      defaultValue: Constants.AUDIENCE_STATUS.DEFAULT,
    },
    creation_status: {
      type: DataTypes.ENUM,
      values: Constants.AUDIENCE_CREATION_STATUS_ARRAY,
      allowNull: false,
      defaultValue: Constants.AUDIENCE_CREATION_STATUS.DEFAULT,
    },
    filters: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    last_sync_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Audience',
    tableName: 'audiences',
  },
);

export default Audience;