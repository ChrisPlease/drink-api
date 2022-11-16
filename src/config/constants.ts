export const HOST = process.env.HOST || 'localhost'
export const PORT = process.env.PORT || 4040

export const dbConfig = {
  user: process.env.PGUSER as string,
  host: process.env.PGHOST || 'http://localhost',
  database: process.env.PGDATABASE as string,
  password: process.env.PGPASSWORD as string,
  port: +(process.env.PGPORT as string) || 5432,
}

export const pagination = {
  size: 12,
  page: 1,
  records: 0,
}
