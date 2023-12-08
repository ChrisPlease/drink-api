import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { createSoftDeleteMiddleware } from 'prisma-soft-delete-middleware'

const isDev = process.env.NODE_ENV === 'develop'

const prisma = new PrismaClient({
  log: <Prisma.LogLevel[]>['info', 'error'].concat(isDev ? [] : []),
})

prisma.$use(
  createSoftDeleteMiddleware({
    models: {
      Drink: {
        field: 'deleted',
        createValue: (value) => value ? new Date() : null,
        allowCompoundUniqueIndexWhere: true,
      },
      Entry: {
        field: 'deleted',
        createValue: (value) => value,
        allowCompoundUniqueIndexWhere: true,
      },
    },
  }),
)

export default prisma
