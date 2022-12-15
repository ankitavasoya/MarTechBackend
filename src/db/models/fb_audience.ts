import { Model, DataTypes, Sequelize, Optional } from 'sequelize';
import sequelizeConnection from '../config';

interface FBAudienceAttributes {
  audience_id?: string,
}

export interface FBAudienceInput extends Optional<FBAudienceAttributes, 'audience_id'> { }
export interface FBAudienceOuput extends Required<FBAudienceInput> { }

class FBAudience extends Model<FBAudienceAttributes, FBAudienceInput> implements FBAudienceAttributes {
  public audience_id!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FBAudience.init(
  {
    audience_id: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize: sequelizeConnection,
    modelName: 'Audience',
    tableName: 'audiences',
  },
);

export default FBAudience;