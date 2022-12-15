import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface CustomerAddressAttributes {
  id?: string,
  address: string,
  city: string,
  state?: string;
  zipCode: number,
  country?: string;
  longitude: number,
  latitude: number,
  customer_id: string,
}

export interface CustomerAddressInput extends Optional<CustomerAddressAttributes, 'id'> { }
export interface CustomerAddressOuput extends Required<CustomerAddressInput> { }

class CustomerAddress extends Model<CustomerAddressAttributes, CustomerAddressInput> implements CustomerAddressAttributes {
  public id!: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public zipCode!: number;
  public country!: string;
  public longitude!: number;
  public latitude!: number;
  public customer_id!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}


CustomerAddress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    address: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
    },
    zipCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'CustomerAddress',
    tableName: 'customer_address',
  },
);

export default CustomerAddress;
