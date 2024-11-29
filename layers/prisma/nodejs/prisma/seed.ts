import { PrismaClient } from '@prisma/client'
import { seedUsers } from './seeders/users'
import { seedDrinks } from './seeders/drinks'

const prisma = new PrismaClient()

async function main() {

  await seedUsers(prisma, [
    'auth0|633cb40c15422d538368f4c6',
    'auth0|6341da849ae95d74a374a5e1',
  ])

  await seedDrinks(prisma)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
