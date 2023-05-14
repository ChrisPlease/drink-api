import { PrismaClient } from '@prisma/client'

export async function seedUsers(prisma: PrismaClient) {
  const userIds = [
    'auth0|633cb40c15422d538368f4c6',
    'auth0|6341da849ae95d74a374a5e1',
  ]

  const [,users] = await prisma.$transaction([
    prisma.user.createMany({ data: userIds.map((id) => ({ id })) }),
    prisma.user.findMany(),
  ])
  return users
}
