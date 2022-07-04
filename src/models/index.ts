import { config } from '../config/constants'
import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize(
  config.database,
  config.user,
  config.password,
  {
    host: config.host,
    dialect: 'postgres',
  },
)

export const db = {
  Sequelize,
  sequelize,
  drinks: require('./Drink.model'),
}
