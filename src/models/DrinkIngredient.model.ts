import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize'

export class DrinkIngredientModel extends Model<
  InferAttributes<DrinkIngredientModel>,
  InferCreationAttributes<DrinkIngredientModel>
> {
  declare drinkId: number
  declare ingredientId: number
}

export const DrinkIngredientFactory = (sequelize: Sequelize) => {
  const DrinkIngredient = DrinkIngredientModel.init({
    drinkId: {
      type: DataTypes.INTEGER,
      allowNull: false,

    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,

    },
  }, {
    modelName: 'DrinkIngredient',
    tableName: 'drink_ingredients',
    sequelize,
    timestamps: false,
    underscored: true,
  })

  return DrinkIngredient
}
