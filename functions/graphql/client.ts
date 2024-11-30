import 'dotenv/config'
import { PrismaClient, Prisma } from '/opt/nodejs/node_modules/.prisma/client'
// import { createSoftDeleteExtension } from 'prisma-extension-soft-delete'

const isDev = process.env.NODE_ENV === 'development'

const prisma = new PrismaClient({
  log: <Prisma.LogLevel[]>['info', 'error'].concat(isDev ? ['query', 'warn'] : []),
})

// prisma.$extends(
//   createSoftDeleteExtension({
//     models: {
//       Drink: {
//         field: 'deleted',
//         createValue: (value: any) => value ? new Date() : null,
//         allowCompoundUniqueIndexWhere: true,
//       },
//       Entry: {
//         field: 'deleted',
//         createValue: (value: any) => value,
//         allowCompoundUniqueIndexWhere: true,
//       },
//     },
//   }),
// )

export default prisma
