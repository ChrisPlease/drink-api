import { config } from '../config/constants'
import { Sequelize } from 'sequelize'
import { DrinkFactory } from './Drink.model'
import { IngredientFactory } from './Ingredient.model'
import { IngredientDrinkFactory } from './IngredientDrink.model'

export const sequelize = new Sequelize(
  config.database,
  config.user,
  config.password,
  {
    // logging: false,
    host: config.host,
    dialect: 'postgres',
  },
)

const Drink = DrinkFactory(sequelize)
const Ingredient = IngredientFactory(sequelize)
const IngredientDrink = IngredientDrinkFactory(sequelize)

Drink.hasMany(Ingredient, { as: 'ingredients' })
Ingredient.belongsTo(Drink)
Drink.belongsToMany(Ingredient, { through: IngredientDrink })

export { Drink, Ingredient }
