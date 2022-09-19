import { dbConfig } from '../config/constants'
import { Sequelize } from 'sequelize'
import { DrinkFactory } from './Drink.model'
import { IngredientFactory } from './Ingredient.model'
import { UserFactory } from './User.model'
import { EntryFactory } from './Entry.model'
import { DateLogFactory } from './DateLog.model'

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    // logging: false,
    quoteIdentifiers: false,
    host: dbConfig.host,
    dialect: 'postgres',
  },
)

const User = UserFactory(sequelize)

const Drink = DrinkFactory(sequelize)
const Ingredient = IngredientFactory(sequelize)
export const DrinkIngredients = sequelize.define(
  'DrinkIngredients',
  {},
  {
    timestamps: false,
    underscored: true,
    tableName: 'drink_ingredients',
  },
)

const Entry = EntryFactory(sequelize)
const DateLog = DateLogFactory(sequelize)

User.hasMany(Drink, { as: 'drinks', foreignKey: { name: 'userId', field: 'user_id' } })
Drink.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id' } })

User.hasMany(Entry, { as: 'entries', foreignKey: { name: 'userId', field: 'user_id' } })
Entry.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id' } })

Drink.belongsToMany(Ingredient, { through: DrinkIngredients })

Drink.hasMany(Ingredient, { as: 'ingredient', foreignKey: { name: 'drinkId', field: 'drink_id' } })
Ingredient.belongsTo(Drink, { foreignKey: { name: 'drinkId', field: 'drink_id'  } })

Drink.hasMany(Entry, { foreignKey: { name: 'drinkId', field: 'drink_id' }})
Entry.belongsTo(Drink, { foreignKey: { name: 'drinkId', field: 'drink_id' } })

Entry.hasOne(DateLog, { foreignKey: { name: 'entryId', field: 'entry_id' } })
DateLog.belongsTo(Entry, { foreignKey: { name: 'entryId', field: 'entry_id' } })

export { User, Drink, Ingredient, Entry, DateLog }
