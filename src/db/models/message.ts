import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface MessageAttributes {
  id?: string,
  from: string,
  to: string,
  msg: string,
  from_customer_id?: string,
  to_customer_id?: string,
  user_id?: string,
  company_id?: string,
}

export interface MessageInput extends Optional<MessageAttributes, 'id'> { }
export interface MessageOuput extends Required<MessageInput> { }

class Message extends Model<MessageAttributes, MessageInput> implements MessageAttributes {
  public id!: string;
  public from!: string;
  public to!: string;
  public msg!: string;
  public from_customer_id!: string;
  public to_customer_id!: string;
  public user_id!: string;
  public company_id!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    msg: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from_customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    to_customer_id: {
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
    modelName: 'Message',
    tableName: 'messages',
  },
);

export default Message;
