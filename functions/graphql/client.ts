import 'dotenv/config'
import { PrismaClient, Prisma } from '/opt/nodejs/node_modules/.prisma/client'
import { existsSync, readdirSync } from 'fs';
import path from 'path';
// import { createSoftDeleteExtension } from 'prisma-extension-soft-delete'

const isDev = process.env.NODE_ENV === 'development'


try {
  console.log('Debugging Layer:')
  const optNodeModulesPath = '/opt/nodejs/node_modules'
  const optPrismaPath = '/opt/nodejs/node_modules/.prisma'

  console.log('Checking /opt/nodejs:')
  console.log(readdirSync('/opt/nodejs'))

  console.log('Checking /opt/nodejs/node_modules:')
  console.log(readdirSync(optNodeModulesPath))

  console.log('Checking /opt/nodejs/node_modules/.prisma:')
  console.log(readdirSync(optPrismaPath))

  console.log('Prisma client files:')
  console.log(readdirSync(path.join(optPrismaPath, 'client')))

  console.log('Prisma engines:')
  console.log(readdirSync(path.join(optPrismaPath, 'client', 'runtime')))

  console.log('Prisma resolved path:', require.resolve('prisma', {
    paths: [optNodeModulesPath],
  }))
} catch (error) {
  console.error('Error while debugging layer at startup:', error)
}

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
