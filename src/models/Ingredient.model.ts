import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  Sequelize,
  ForeignKey,
  NonAttribute,
  HasOneSetAssociationMixin,
  HasOneCreateAssociationMixin,
} from 'sequelize'
import { DrinkModel } from './Drink.model'

export class IngredientModel extends Model<
  InferAttributes<IngredientModel>,
  InferCreationAttributes<IngredientModel>
> {
  type: CreationOptional<'ingredients'> = 'ingredients'
  declare id: CreationOptional<number>
  declare parts: number
  declare drinkId: ForeignKey<number>

  declare relationshipNames: CreationOptional<string[]>

  declare createDrink: HasOneCreateAssociationMixin<DrinkModel>
  declare setDrink: HasOneSetAssociationMixin<DrinkModel, number>
  declare drink?: NonAttribute<DrinkModel>

}

export const IngredientFactory = (sequelize: Sequelize) => {
  const Ingredient = IngredientModel.init({

    type: {
      type: DataTypes.VIRTUAL,
      defaultValue: 'ingredients',
    },

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    parts: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    relationshipNames: {
      type: DataTypes.VIRTUAL,
      get() {
        return ['drink']
      },
    },

  }, {
    sequelize,
    modelName: 'ingredient',
    underscored: true,
    timestamps: false,
  })

  return Ingredient
}
