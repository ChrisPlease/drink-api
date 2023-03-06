import { QueryResolvers } from '../__generated__/graphql'
import { Entries } from '../models/Entry.model'
import { Drink } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'

export const queryResolvers: QueryResolvers = {

  async drink(_, { drinkId }, { prisma }) {
    const drink = await prisma.drink.findUnique({
      where: { id: drinkId },
    })
    return drink
  },

  async drinks(_, { userId }, { prisma, req: { auth } }) {
    return await prisma.drink.findMany({
      where: {
        ...(
          userId ? { userId } : {
            OR: [
              { userId: auth?.sub },
              { userId: null },
            ],
          }
        ),
      },
    })
  },

  async entries(_, { drinkId, distinct }, { prisma, req: { auth } }) {
    const entries = Entries(prisma.entry)

    return await entries
      .findWithNutrition(
        auth?.sub,
        <string>drinkId,
        distinct === null ? undefined : distinct,
      )
  },

  async drinkHistory(_, { drinkId }, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub
    const [{ _count: count, _max, _sum }] = await prisma.entry.groupBy({
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

    const drink = <Drink>await prisma.drink.findUnique({
      where: { id: drinkId },
    })

    const totalVolume = _sum.volume || 0
    const lastEntry = _max.timestamp

    return {
      drink,
      count,
      totalVolume,
      waterVolume: roundNumber(totalVolume * (drink?.coefficient || 0)),
      lastEntry,
    }
  },

  async drinksHistory(_, __, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub

    type RawEntry = {
      drink: Drink,
      count: number,
      total_volume: number,
      water_volume: number,
      last_entry: Date,
    }

    const entries = <RawEntry[]>await prisma.$queryRaw`
    SELECT
      json_build_object(
        'id', d.id,
        'coefficient', d.coefficient
      ) AS drink,
      e.count,
      e.water_volume,
      e.total_volume,
      e.last_entry
    FROM drinks d
    LEFT JOIN (	SELECT
        d.id AS drink_id,
          COALESCE(COUNT(e)::int,0) AS count,
          COALESCE(SUM(e.volume),0) AS total_volume,
          COALESCE(SUM(e.volume*d.coefficient),0) AS water_volume,
          MAX(e.timestamp) AS last_entry
        FROM drinks d
        LEFT JOIN entries e ON e.drink_id = d.id AND e.user_id = ${userId}
        GROUP BY d.id
    ) e ON e.drink_id = d.id
    ORDER BY
      CASE WHEN e.last_entry IS NULL THEN 1
      ELSE 0
    END, e.last_entry desc;`

    return entries.map(({
      water_volume: waterVolume,
      total_volume: totalVolume,
      last_entry: lastEntry,
      ...entry
    }) => ({ waterVolume, totalVolume, lastEntry,...entry }))
  },
}

