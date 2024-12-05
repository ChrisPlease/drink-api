import { PrismaClient } from '/opt/nodejs/node_modules/.prisma/client'

const prisma = new PrismaClient()

export default async () => {
  await prisma.$transaction([
    prisma.drink.deleteMany(),
    prisma.nutrition.deleteMany(),
    prisma.entry.deleteMany(),
    prisma.ingredient.deleteMany(),
    prisma.user.deleteMany(),
  ])
}
