import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface MealDeliverySubscriptionAttributes {
  id?: string,
  order_code: string,
  driver: string,
  order_startdate: Date | string,
  order_enddate: Date | string,
  lunch_delivery: boolean,
  dinner_delivery: boolean,
  rice_addon: boolean,
  order_quantity: number,
  remarks: string,
  order_price: number,
  delivery_time: string,
  customer_id: string,
}

export interface MealDeliverySubscriptionInput extends Optional<MealDeliverySubscriptionAttributes, 'id'> { }
export interface MealDeliverySubscriptionOuput extends Required<MealDeliverySubscriptionInput> { }

class MealDeliverySubscription extends Model<MealDeliverySubscriptionAttributes, MealDeliverySubscriptionInput> implements MealDeliverySubscriptionAttributes {
  public id!: string;
  public order_code!: string;
  public driver!: string;
  public order_startdate!: Date | string;
  public order_enddate!: Date | string;
  public lunch_delivery!: boolean;
  public dinner_delivery!: boolean;
  public rice_addon!: boolean;
  public order_quantity!: number;
  public remarks!: string;
  public order_price!: number;
  public delivery_time!: string;
  public customer_id!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MealDeliverySubscription.init(
  {
    order_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    driver: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order_startdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    order_enddate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lunch_delivery: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    dinner_delivery: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    rice_addon: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    order_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    order_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    delivery_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'MealDeliverySubscription',
    tableName: 'meal_delivery_subscription',
  },
);

export default MealDeliverySubscription;
