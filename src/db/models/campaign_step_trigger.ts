import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import { CampaignStepInput } from './campaign_step';

interface CampaignStepTriggerAttributes {
  id?: string,
  campaign_step_id: string,
  trigger_at: Date | string,

  readonly campaignStep?: CampaignStepInput;
}

export interface CampaignStepTriggerInput extends Optional<CampaignStepTriggerAttributes, 'id'> { }
export interface CampaignStepTriggerOuput extends Required<CampaignStepTriggerInput> { }

class CampaignStepTrigger extends Model<CampaignStepTriggerAttributes, CampaignStepTriggerInput> implements CampaignStepTriggerAttributes {
  public id!: string;
  public campaign_step_id!: string;
  public trigger_at!: Date | string;

  public readonly campaignStep?: CampaignStepInput;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CampaignStepTrigger.init(
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
    trigger_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'CampaignStepTrigger',
    tableName: 'campaign_step_triggers',
  },
);

export default CampaignStepTrigger;