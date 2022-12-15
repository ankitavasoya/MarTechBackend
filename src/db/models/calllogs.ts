import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface CallLogsAttributes {
  id?: string,
  log_description: string,
  customer_id: string,
  user_id: string,
  company_id: string,
}

export interface CallLogsInput extends Optional<CallLogsAttributes, 'id'> { }
export interface CallLogsOuput extends Required<CallLogsInput> { }

class CallLogs extends Model<CallLogsAttributes, CallLogsInput> implements CallLogsAttributes {
  public id!: string;
  public log_description!: string;
  public customer_id!: string;
  public user_id!: string;
  public company_id!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CallLogs.init(
  {
    log_description: {
      type: DataTypes.STRING,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'CallLogs',
    tableName: 'call_logs',
  },
);

export default CallLogs;