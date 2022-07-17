import { config } from '../config/constants'
import { Sequelize } from 'sequelize'
import { DrinkFactory } from './Drink.model'
import { IngredientFactory } from './Ingredient.model'
import { UserFactory } from './User.model'

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

const User = UserFactory(sequelize)
const Drink = DrinkFactory(sequelize)
const Ingredient = IngredientFactory(sequelize)

Drink.hasMany(Ingredient, { as: 'ingredients' })
Ingredient.belongsTo(Drink)

export { User, Drink, Ingredient }
