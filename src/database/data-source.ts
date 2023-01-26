import { DataSource } from 'typeorm'
import { dbConfig } from '../constants/db'
import { DateLog } from './entities/DateLog.entity'
import { Drink } from './entities/Drink.entity'
import { Entry } from './entities/Entry.entity'
import { Ingredient } from './entities/Ingredient.entity'
import { User } from './entities/User.entity'

export const dataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.user,
  password: dbConfig.password,
  database: 'api',
  synchronize: false,
  logging: ['query'],
  migrations: [
    `${__dirname}/migrations/*`,
  ],
  entities: [
    User,
    Drink,
    Ingredient,
    Entry,
    DateLog,
  ],
})
