import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  DataTypes,
  HasManyAddAssociationsMixin,
  NonAttribute,
  Sequelize,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  ForeignKey,
  Association,
  BelongsToManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasOneGetAssociationMixin,
} from 'sequelize'
import { roundNumber } from '../utils/roundNumber'
import { IngredientModel } from './Ingredient.model'
import { UserModel } from './User.model'

export class DrinkModel extends Model<
  InferAttributes<DrinkModel>,
  InferCreationAttributes<DrinkModel>
> {
  declare id: CreationOptional<number>

  declare name: string
  declare icon: string
  declare coefficient: CreationOptional<number>
  declare caffeine: CreationOptional<number>
  declare sugar: CreationOptional<number>

  declare setIngredients: HasManySetAssociationsMixin<IngredientModel, 'drinkId'>
  declare addIngredient: HasManyAddAssociationMixin<IngredientModel, number>
  declare addIngredients: HasManyAddAssociationsMixin<IngredientModel, number>
  declare hasIngredients: HasManyHasAssociationMixin<IngredientModel, number>
  declare getIngredients: BelongsToManyGetAssociationsMixin<IngredientModel>

  declare getUser: HasOneGetAssociationMixin<UserModel>

  declare ingredients?: NonAttribute<IngredientModel[]>

  declare totalParts: CreationOptional<number>

  declare userId: ForeignKey<string | null>

  get isMixedDrink(): NonAttribute<boolean> {
    return this.totalParts > 1
  }

  declare static associations: {
    ingredients: Association<DrinkModel, IngredientModel>,
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
      unique: 'userId',
    },

    icon: {
      type: DataTypes.STRING,
      defaultValue: 'glass-water',
    },

    coefficient: {
      type: DataTypes.FLOAT(2),
      validate: {
        max: 1,
      },
      get(): number {
        return this.getDataValue('coefficient')
      },
      set(value: number): void {
        this.setDataValue('coefficient', value)
      },
    },

    caffeine: {
      type: DataTypes.FLOAT(2),
      validate: {
        min: 0,
      },
      get(): number {
        return this.getDataValue('caffeine')
      },
      defaultValue: 0,
    },

    sugar: {
      type: DataTypes.FLOAT(2),
      validate: {
        min: 0,
      },
      defaultValue: 0,
    },

    totalParts: {
      type: DataTypes.VIRTUAL,
      get(): number {
        return this.ingredients?.reduce((acc, { parts }) => acc += parts, 0) || 1
      },
    },

    userId: {
      type: DataTypes.STRING,
      unique: 'userId',
    },
  }, {
    modelName: 'drink',
    underscored: true,
    sequelize,
  })

  Drink.beforeSave(async (drink) => {

    const nutrition = {
      caffeine: drink.getDataValue('caffeine') ?? 0,
      coefficient: drink.getDataValue('coefficient') ?? 0,
      sugar: drink.getDataValue('sugar') ?? 0,
    }

    if (drink.ingredients && drink.ingredients?.length > 1) {
      const { ingredients } = drink
      for (const ingredient of ingredients) {
        const {
          coefficient: drinkCoefficient,
          caffeine: drinkCaffeine,
          sugar: drinkSugar,
        } = await Drink.findByPk(ingredient.drinkId) as DrinkModel
        nutrition.caffeine += ((ingredient.parts/drink.totalParts)*drinkCaffeine)
        nutrition.coefficient += ((ingredient.parts/drink.totalParts)*drinkCoefficient)
        nutrition.sugar += ((ingredient.parts/drink.totalParts)*drinkSugar)
      }

      Object.entries(nutrition)
        .forEach(([key, value]: [key: any, value: any]) => drink.setDataValue(key, roundNumber(value)))
    }
  })

  return Drink
}
