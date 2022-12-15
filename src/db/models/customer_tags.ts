import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface CustomerTagAttributes {
  id?: string,
  tag_name: string,
  company_id: string,
}

export interface CustomerTagInput extends Optional<CustomerTagAttributes, 'id'> { }
export interface CustomerTagOuput extends Required<CustomerTagInput> { }

class CustomerTag extends Model<CustomerTagAttributes, CustomerTagInput> implements CustomerTagAttributes {
  public id!: string;
  public company_id!: string;
  public tag_name!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CustomerTag.init(
  {
    tag_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_id: {
      allowNull: false,
      type: DataTypes.UUID,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'CustomerTags',
    tableName: 'customer_tags',
  },
);

export default CustomerTag;
