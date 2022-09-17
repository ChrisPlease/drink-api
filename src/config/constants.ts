export const PORT = process.env.PORT || 4040

export const DB_CONFIG = {
  user: process.env.PGUSER as string,
  host: process.env.PGHOST as string,
  database: process.env.PGDATABASE as string,
  password: process.env.PGPASSWORD as string,
  port: +(process.env.PGPORT as string) || 5432,
}

export const PAGINATION = {
  size: 12,
  number: 1,
  records: 0,
}
