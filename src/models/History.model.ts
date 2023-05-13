import { PrismaClient, Drink, Prisma } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'
import { deconstructId, toCursorHash } from '../utils/cursorHash'

export function DrinkHistory(client: PrismaClient) {
  return Object.assign({}, {
    async findDrinkHistory(
      args: Pick<Prisma.EntryAggregateArgs, 'where'>,
    ) {
      return await client.$transaction(async (tx) => {
        const drinkId = <string>args.where?.drinkId
        const [,dehashedId] = deconstructId(drinkId)
        const where = { drinkId: dehashedId, userId: args.where?.userId }
        const [{
          _count: count,
          _max: max,
          _sum: sum,
        }] = await tx.entry.groupBy({
          where: { ...where, deleted: false },
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
        } = <Drink & { _count: { ingredients: number } }>await tx.drink.findUnique({
          where: { id: dehashedId },
          include: {
            _count: { select: { ingredients: true } },
          },
        })

        const totalVolume = sum.volume || 0
        const lastEntry = max.timestamp

        return {
          id: toCursorHash(`DrinkHistory:${dehashedId}`),
          drink: { id: toCursorHash(`${
            ingredients > 0 ? 'Mixed' : 'Base'
          }Drink:${id}`), ...drink },
          count,
          totalVolume,
          waterVolume: roundNumber(totalVolume * (drink?.coefficient || 0)),
          lastEntry,
        }
      })
    },
  })
}
