import { PrismaClient } from '@prisma/client'

export async function seedUsers(prisma: PrismaClient, userIds: string[]) {
  const [,users] = await prisma.$transaction([
    prisma.user.createMany({ data: userIds.map((id) => ({ id })) }),
    prisma.user.findMany(),
  ])
  return users
}
