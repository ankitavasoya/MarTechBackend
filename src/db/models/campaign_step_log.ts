import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import { CampaignStepInput } from './campaign_step';

interface CampaignStepLogAttributes {
  id?: string,
  campaign_step_id: string,
  audience_id: string,
  customer_id: string,
  readonly campaignStep?: CampaignStepInput;
}

export interface CampaignStepLogInput extends Optional<CampaignStepLogAttributes, 'id'> { }
export interface CampaignStepLogOuput extends Required<CampaignStepLogInput> { }

class CampaignStepLog extends Model<CampaignStepLogAttributes, CampaignStepLogInput> implements CampaignStepLogAttributes {
  public id!: string;
  public campaign_step_id!: string;
  public audience_id!: string;
  public customer_id!: string;

  public readonly campaignStep?: CampaignStepInput;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CampaignStepLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaign_step_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    audience_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'CampaignStepLog',
    tableName: 'campaign_step_logs',
  },
);

export default CampaignStepLog;