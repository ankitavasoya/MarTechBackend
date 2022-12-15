import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface SalesRecordingAttributes {
  id?: string,
  url: string,
  sales_template_id: string,
  is_selected: boolean,
  is_deleted: boolean,
}

export interface SalesRecordingInput extends Optional<SalesRecordingAttributes, 'id'> { }
export interface SalesRecordingOuput extends Required<SalesRecordingInput> { }

class SalesRecording extends Model<SalesRecordingAttributes, SalesRecordingInput> implements SalesRecordingAttributes {
  public id!: string;
  public url!: string;
  public sales_template_id!: string;
  public is_selected!: boolean;
  public is_deleted!: boolean;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SalesRecording.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    url: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    sales_template_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_selected: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    is_deleted: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'SalesRecordings',
    tableName: 'sales_recordings',
  },
);

export default SalesRecording;
