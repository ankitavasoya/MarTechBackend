import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface IndustryAttributes {
  id?: string,
  industry: string,
}

export interface IndustryInput extends Optional<IndustryAttributes, 'id'> { }
export interface IndustryOuput extends Required<IndustryInput> { }

class Industry extends Model<IndustryAttributes, IndustryInput> implements IndustryAttributes {
  public id!: string;
  public industry!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Industry.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    industry: {
      type: DataTypes.ENUM('Solar Company', 'Self Delivery Restaurant'), // this will limit the industry name to be either Solar Company or Self Delivery Restaurant, if you are going to expand your industries you might need to add it to the list.
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Industry',
    tableName: 'industries',
  },
);

export default Industry;
