import { DataSource } from 'typeorm'
import { dbConfig } from '../constants/db'

export const dataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.user,
  password: dbConfig.password,
  database: 'api',
  synchronize: false,
  logging: 'all',
  migrations: [`${__dirname}/migrations/**/*.{js,ts}`],
  entities: [`${__dirname}/entities/**/*.{js,ts}`],
})
