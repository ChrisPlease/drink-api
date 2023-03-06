import { PrismaClient } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'
import { Entry } from '../__generated__/graphql'

type Nutrition = {
  caffeine: number,
  waterContent: number,
  sugar: number,
}

export function Entries(prismaEntry: PrismaClient['entry']) {
  return Object.assign(prismaEntry, {
    async findWithNutrition(
      userId?: string,
      drinkId?: string,
      distinct = false,
    ): Promise<Entry[]> {
      const entries = await prismaEntry.findMany({
        where: {
          AND: [{ drinkId }, { userId }],
        },
        ...(distinct ? { distinct: ['volume'] } : {}),
        include: {
          drink: {
            select: {
              caffeine: true,
              sugar: true,
              coefficient: true,
            },
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      })


      return entries.map(({ drink, ...entry }) => {
        const nutrition: Nutrition = {
          caffeine: roundNumber((drink.caffeine ?? 0) * entry.volume),
          sugar: roundNumber((drink.sugar ?? 0) * entry.volume),
          waterContent: roundNumber((drink.coefficient ?? 0) * entry.volume),
        }

        return {
          ...nutrition,
          ...entry,
        }
      })
    },
  })
}

