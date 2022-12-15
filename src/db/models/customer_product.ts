import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface CustomerProductAttributes {
  id?: string,
  order_code: string,
  product_name: string,
  sales_amount: number,
  customer_id: string,
  remarks?: string,
}

export interface CustomerProductInput extends Optional<CustomerProductAttributes, 'id'> { }
export interface CustomerProductOuput extends Required<CustomerProductInput> { }

class CustomerProduct extends Model<CustomerProductAttributes, CustomerProductInput> implements CustomerProductAttributes {
  public id!: string;
  public order_code!: string;
  public product_name!: string;
  public sales_amount!: number;
  public customer_id!: string;
  public remarks!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CustomerProduct.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sales_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'CustomerProduct',
    tableName: 'customer_products',
  },
);

export default CustomerProduct;
