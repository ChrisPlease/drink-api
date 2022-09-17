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
  Association,
} from 'sequelize'
import { IngredientModel } from './Ingredient.model'

export class DrinkModel extends Model<
  InferAttributes<DrinkModel>,
  InferCreationAttributes<DrinkModel>
> {
  type: CreationOptional<'drink'> = 'drink'
  declare id: CreationOptional<number>

  declare name: string
  declare icon: string
  declare coefficient: CreationOptional<number>
  declare caffeine: CreationOptional<number>
  declare sugar: CreationOptional<number>

  declare setIngredients: HasManySetAssociationsMixin<IngredientModel, 'drinkId'>
  declare addIngredient: HasManyAddAssociationMixin<IngredientModel, number>
  declare addIngredients: HasManyAddAssociationsMixin<IngredientModel, number>
  declare getIngredients: HasManyGetAssociationsMixin<IngredientModel>

  declare ingredients?: NonAttribute<IngredientModel[]>

  declare relationshipNames: CreationOptional<string[]>

  declare totalParts: CreationOptional<number>

  declare userId: ForeignKey<number | null>

  get isMixedDrink(): NonAttribute<boolean> {
    return this.totalParts > 1
  }

  isUserDrink(drinkId: number): NonAttribute<boolean> {
    return drinkId === this.id
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

    type: {
      type: DataTypes.VIRTUAL,
      defaultValue: 'drink',
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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

    relationshipNames: {
      type: DataTypes.VIRTUAL,
      get(): string[] {
        return ['user', 'ingredients']
      },
    },
  }, {
    modelName: 'drink',
    sequelize,
    timestamps: false,
  })


  Drink.beforeSave(async (drink) => {
    console.log('maybe updating?', drink.toJSON())
    let caffeine = drink.getDataValue('caffeine') ?? 0
    let coefficient = drink.getDataValue('coefficient') ?? 0
    let sugar = drink.getDataValue('sugar') ?? 0

    if (drink.ingredients && drink.ingredients?.length > 1) {
      const { ingredients } = drink
      for (const ingredient of ingredients) {
        const {
          coefficient: drinkCoefficient,
          caffeine: drinkCaffeine,
          sugar: drinkSugar,
        } = await Drink.findByPk(ingredient.drinkId) as DrinkModel
        caffeine += ((ingredient.parts/drink.totalParts)*drinkCaffeine)
        coefficient += ((ingredient.parts/drink.totalParts)*drinkCoefficient)
        sugar += ((ingredient.parts/drink.totalParts)*drinkSugar)
      }

      drink.setDataValue('caffeine', caffeine)
      drink.setDataValue('coefficient', coefficient)
      drink.setDataValue('sugar', sugar)
    }
  })
  return Drink
}
