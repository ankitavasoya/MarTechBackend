import { Model, DataTypes, Optional } from 'sequelize';
import sequelizeConnection from '../config';
import { CustomerInput } from './customer';


interface AudienceCustomerAttributes {
  id?: string,
  audience_id: string,
  customer_id: string,

  readonly customer?: CustomerInput;
}

export interface AudienceCustomerInput extends Optional<AudienceCustomerAttributes, 'id'> { }
export interface AudienceCustomerOuput extends Required<AudienceCustomerInput> { }

class AudienceCustomer extends Model<AudienceCustomerAttributes, AudienceCustomerInput> implements AudienceCustomerAttributes {
  public id!: string;
  public audience_id!: string;
  public customer_id!: string;

  public readonly customer?: CustomerInput;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AudienceCustomer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    audience_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'AudienceCustomer',
    tableName: 'audience_customers',
  },
);

export default AudienceCustomer;