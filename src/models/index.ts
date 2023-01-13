import { dbConfig } from '../constants/db'
import { Sequelize } from 'sequelize'
import { DrinkFactory } from './Drink.model'
import { IngredientFactory } from './Ingredient.model'
import { DrinkIngredientFactory } from './DrinkIngredient.model'
import { UserFactory } from './User.model'
import { EntryFactory } from './Entry.model'
import { EntryLogFactory } from './EntryLog.model'
import { DateLogFactory } from './DateLog.model'

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    logging: process.env.NODE_ENV === 'develop' && console.log,
    quoteIdentifiers: false,
    host: dbConfig.host,
    dialect: 'postgres',
  },
)

const User = UserFactory(sequelize)

const Drink = DrinkFactory(sequelize)
const Ingredient = IngredientFactory(sequelize)
const DrinkIngredient = DrinkIngredientFactory(sequelize)

const Entry = EntryFactory(sequelize)
const DateLog = DateLogFactory(sequelize)
const EntryLog = EntryLogFactory(sequelize)

User.hasMany(Drink, { as: 'drinks', foreignKey: { name: 'userId', field: 'user_id' } })
Drink.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id' } })

User.hasMany(Entry, { as: 'entries', foreignKey: { name: 'userId', field: 'user_id' } })
Entry.belongsTo(User, { foreignKey: { name: 'userId', field: 'user_id' } })

Drink.belongsToMany(Ingredient, { through: DrinkIngredient })
Ingredient.belongsToMany(Drink, { through: DrinkIngredient })
Ingredient.hasOne(DrinkIngredient, {
  as: 'drinkIngredient',
  foreignKey: { name: 'ingredientId', field: 'ingredient_id' },
})
DrinkIngredient.belongsTo(Ingredient)

Drink.hasMany(Ingredient, { as: 'ingredient', foreignKey: { name: 'drinkId', field: 'drink_id' } })
Ingredient.belongsTo(Drink, { foreignKey: { name: 'drinkId', field: 'drink_id'  } })

Drink.hasMany(Entry, { foreignKey: { name: 'drinkId', field: 'drink_id' }})
Entry.belongsTo(Drink, { foreignKey: { name: 'drinkId', field: 'drink_id' } })

Entry.belongsToMany(DateLog, { through: EntryLog })
DateLog.belongsToMany(Entry, { through: EntryLog })
Entry.hasMany(EntryLog)
DateLog.hasMany(EntryLog, {
  as: 'entryLog',
})
Entry.hasOne(DateLog, { foreignKey: { name: 'entryId', field: 'entry_id' } })
DateLog.belongsTo(Entry, { foreignKey: { name: 'entryId', field: 'entry_id' } })


export {
  User,
  Drink,
  Ingredient,
  DrinkIngredient,
  Entry,
  DateLog,
  EntryLog,
 }
