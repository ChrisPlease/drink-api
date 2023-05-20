import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'

const isDev = process.env.NODE_ENV === 'develop'

const prisma = new PrismaClient({
  log: <Prisma.LogLevel[]>['info', 'error'].concat(isDev ? ['query'] : []),
})
export default prisma
