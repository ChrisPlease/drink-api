import { PrismaClient } from '@prisma/client'

type Entry = {
  userId: string,
  drinkId: string,
  volume: number,
}

export async function seedEntries(prisma: PrismaClient, entries: Entry[]) {
  return await Promise.all(entries.map(async (entry, index) => {
    return await prisma.entry.create({
      data: { timestamp: new Date(2023, 1, 0, 0, 0, index), ...entry },
    })
  }))
}
