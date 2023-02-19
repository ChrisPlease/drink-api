import { DataSource } from 'typeorm'
import { dbConfig } from '../constants/db'

export const dataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  synchronize: process.env.NODE_ENV === 'develop',
  logging: 'all',
  migrations: [`${__dirname}/migrations/**/*.{js,ts}`],
  entities: [`${__dirname}/entities/**/*.{js,ts}`],
})
