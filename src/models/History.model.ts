import { PrismaClient, Drink, Prisma } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'
import { toCursorHash } from '../utils/cursorHash'

export function DrinkHistory(client: PrismaClient) {
  return Object.assign({}, {
    async findDrinkHistory(
      args: Pick<Prisma.EntryAggregateArgs, 'where'>,
    ) {
      const [{
        _count: count,
        _max: max,
        _sum: sum,
      }] = await client.entry.groupBy({
        ...args,
        by: ['drinkId', 'userId'],
        _max: {
          timestamp: true,
        },
        _count: true,
        _sum: {
          volume: true,
        },
      })


      const {
        id,
        _count: { ingredients },
        ...drink
      } = <Drink & { _count: { ingredients: number } }>await client.drink.findUnique({
        where: { id: <string>args.where?.drinkId },
        include: {
          _count: { select: { ingredients: true } },
        },
      })

      const totalVolume = sum.volume || 0
      const lastEntry = max.timestamp

      return {
        id,
        drink: { id: toCursorHash(`${
          ingredients > 0 ? 'Mixed' : 'Base'
        }Drink:${id}`), ...drink },
        count,
        totalVolume,
        waterVolume: roundNumber(totalVolume * (drink?.coefficient || 0)),
        lastEntry,
      }
    },
  })
}
