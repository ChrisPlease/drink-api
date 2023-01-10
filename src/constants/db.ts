export const dbConfig = {
  user: process.env.PGUSER as string,
  host: process.env.PGHOST || 'http://localhost',
  database: process.env.PGDATABASE as string,
  password: process.env.PGPASSWORD as string,
  port: +(process.env.PGPORT as string) || 5432,
}
