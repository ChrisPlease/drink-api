import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async () => {
  await prisma.$transaction([
    prisma.drink.deleteMany(),
    prisma.ingredient.deleteMany(),
    prisma.entry.deleteMany(),
    prisma.user.deleteMany(),
  ])
}
