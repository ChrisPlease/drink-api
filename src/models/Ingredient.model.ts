import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
  ForeignKey,
} from 'sequelize'

export class IngredientModel extends Model<
  InferAttributes<IngredientModel>,
  InferCreationAttributes<IngredientModel>
> {
  declare id: CreationOptional<number>;
  declare parts: number;

  declare drinkId: ForeignKey<number>;
}

export const IngredientFactory = (sequelize: Sequelize) => {
  return IngredientModel.init({
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
    modelName: 'ingredient',
    timestamps: false,
  })
}
