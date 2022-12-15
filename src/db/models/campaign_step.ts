import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import { CampaignInput } from './campaign';

interface CampaignStepAttributes {
  id?: string,
  campaign_id: string,
  step_index: number,
  step_name: string,
  step_delay_time: StepCampaignDelayTime,
  step_delay_value?: string,
  step_campaign_type: StepCampaignType
  step_campaign_content_type: StepCampaignContentType;
  step_sales_template_id?: string;

  readonly campaign?: CampaignInput;
}

export enum StepCampaignType {
  SMS = 'sms',
  CALL = 'call',
  EMAIL = 'email',
}

export enum StepCampaignDelayTime {
  IMMEDIATELY = 'immediately',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
}

export enum StepCampaignContentType {
  AUDIO = 'audio',
  IVR = 'ivr',
  DROP_RVM = 'drop_rvm',
  SALES_BRIDGE = 'sales_bridge',
}

export interface CampaignStepInput extends Optional<CampaignStepAttributes, 'id'> { }
export interface CampaignStepOuput extends Required<CampaignStepInput> { }

class CampaignStep extends Model<CampaignStepAttributes, CampaignStepInput> implements CampaignStepAttributes {
  public id!: string;
  public step_index!: number;
  public step_name!: string;
  public campaign_id!: string;
  public step_delay_time!: StepCampaignDelayTime;
  public step_delay_value!: string;
  public step_campaign_type!: StepCampaignType;
  public step_campaign_content_type!: StepCampaignContentType;
  public step_sales_template_id!: string;

  public readonly campaign?: CampaignInput;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CampaignStep.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    campaign_id: {
      type: DataTypes.UUID,
      allowNull: true, // updated to accomodate delete
    },
    step_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    step_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    step_delay_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    step_delay_value: {
      type: DataTypes.STRING,
    },
    step_campaign_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    step_campaign_content_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    step_sales_template_id: {
      type: DataTypes.UUID,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'CampaignStep',
    tableName: 'campaign_steps',
  },
);

export default CampaignStep;