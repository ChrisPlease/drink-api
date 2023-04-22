import { PrismaClient, Drink } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'
import { toCursorHash } from '../utils/cursorHash'

export function DrinkHistory(client: PrismaClient) {
  return Object.assign({}, {
    async findDrinkHistory(
      { drinkId, userId }: { drinkId: string; userId: string }) {
      const [{ _count: count, _max, _sum }] = await client.entry.groupBy({
        where: { drinkId, userId },
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
        where: { id: drinkId },
        include: {
          _count: { select: { ingredients: true } },
        },
      })

      const totalVolume = _sum.volume || 0
      const lastEntry = _max.timestamp

      return {
        id,
        drink: { id: toCursorHash(`${ingredients > 0 ? 'Mixed' : 'Base'}Drink:${id}`), ...drink },
        count,
        totalVolume,
        waterVolume: roundNumber(totalVolume * (drink?.coefficient || 0)),
        lastEntry,
      }
    },
  })
}