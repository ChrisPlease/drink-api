import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
  ForeignKey,
} from 'sequelize'

export class IngredientDrinkModel extends Model<
  InferAttributes<IngredientDrinkModel>,
  InferCreationAttributes<IngredientDrinkModel>
> {
  declare ingredientId: number;
  declare drinkId: number;
}

export const IngredientDrinkFactory = (sequelize: Sequelize) => {
  return IngredientDrinkModel.init({
    ingredientId: {
      type: DataTypes.INTEGER,
    },

    drinkId: {
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'ingredientDrinks',
    sequelize,
    timestamps: false,
  })
}
