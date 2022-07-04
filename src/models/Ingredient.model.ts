import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
} from 'sequelize'
import { sequelize } from '.'

class Ingredient extends Model<
  InferAttributes<Ingredient>,
  InferCreationAttributes<Ingredient>
> {
  declare id: CreationOptional<number>;
  declare parts: number;
}

Ingredient.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  parts: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Ingredient',
})

export { Ingredient }
