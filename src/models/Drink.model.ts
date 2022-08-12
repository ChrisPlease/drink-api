import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  HasManyAddAssociationsMixin,
  HasManyGetAssociationsMixin,
  NonAttribute,
  Sequelize,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  ForeignKey,
} from 'sequelize'
import { IngredientModel } from './Ingredient.model'

export class DrinkModel extends Model<
  InferAttributes<DrinkModel>,
  InferCreationAttributes<DrinkModel>
> {
  declare id: CreationOptional<number>

  declare name: string
  declare coefficient: CreationOptional<number>
  declare caffeine: CreationOptional<number>

  declare setIngredients: HasManySetAssociationsMixin<IngredientModel, number>
  declare addIngredient: HasManyAddAssociationMixin<DrinkModel, number>
  declare addIngredients: HasManyAddAssociationsMixin<IngredientModel, number>
  declare getIngredients: HasManyGetAssociationsMixin<IngredientModel>

  declare ingredients?: NonAttribute<IngredientModel[]>

  declare totalParts: CreationOptional<number>

  declare userId: ForeignKey<number>

  get isMixedDrink(): NonAttribute<boolean> {
    return !!this.ingredients?.length
  }
}

export const DrinkFactory = (sequelize: Sequelize) => {
  const Drink = DrinkModel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    coefficient: {
      type: DataTypes.FLOAT(3),
      validate: {
        max: 1,
      },
    },

    caffeine: {
      type: DataTypes.FLOAT(3),
      validate: {
        min: 0,
      },
      get(): number {
        return this.getDataValue('caffeine')
      },
    },

    totalParts: {
      type: DataTypes.VIRTUAL,
      get(): number {
        return this.ingredients?.reduce((acc, { parts }) => acc += parts, 0) || 1
      },
    },
  }, {
    modelName: 'drink',
    sequelize,
    timestamps: false,
  })

  Drink.beforeCreate(async (drink) => {
    let caffeine = drink.getDataValue('caffeine') ?? 0
    let coefficient = drink.getDataValue('coefficient') ?? 0

    if (drink.ingredients && drink.ingredients?.length > 1) {
      const { ingredients } = drink
      for (const ingredient of ingredients) {
        const { coefficient: drinkCoefficient, caffeine: drinkCaffeine } = await Drink.findByPk(ingredient.drinkId) as DrinkModel
        caffeine += ((ingredient.parts/drink.totalParts)*drinkCaffeine)
        coefficient += ((ingredient.parts/drink.totalParts)*drinkCoefficient)
      }

      drink.setDataValue('caffeine', caffeine)
      drink.setDataValue('coefficient', coefficient)
    }
  })

  return Drink
}
