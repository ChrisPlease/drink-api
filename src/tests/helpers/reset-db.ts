import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async () => {
  await prisma.$transaction([
    prisma.entry.deleteMany(),
    prisma.drink.deleteMany(),
    prisma.ingredient.deleteMany(),
    prisma.user.deleteMany(),
  ])
}
