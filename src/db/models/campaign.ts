import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface CampaignAttributes {
  id?: string,
  campaign_name: string,
  audience_id: string,
  company_id: string,
  status: string,
  createdBy: string,
  updatedBy: string,
}

export interface CampaignInput extends Optional<CampaignAttributes, 'id'> { }
export interface CampaignOuput extends Required<CampaignInput> { }

class Campaign extends Model<CampaignAttributes, CampaignInput> implements CampaignAttributes {
  public id!: string;
  public campaign_name!: string;
  public audience_id!: string;
  public company_id!: string;
  public status!: string;
  public createdBy!: string;
  public updatedBy!: string;


  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Campaign.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaign_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    audience_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Campaign',
    tableName: 'campaigns',
  },
);

export default Campaign;