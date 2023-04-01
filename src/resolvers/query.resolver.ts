import { QueryResolvers } from '../__generated__/graphql'
import { Entries } from '../models/Entry.model'
import { Drink, Prisma } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import { toCursorHash, fromCursorHash } from '../utils/cursorHash'

export const queryResolvers: QueryResolvers = {

  async drink(_, { drinkId }, { prisma }) {
    const drink = await prisma.drink.findUnique({
      where: { id: drinkId },
    })
    return drink
  },

  async drinks(
    _,
    {
      search,
      sort,
      userId,
      first,
      last,
      before,
      after,
    }, { prisma, req: { auth } }) {
    const orderBy = <Prisma.DrinkOrderByWithRelationInput>(
      sort ? sort : { name: 'asc' }
    )
    const sortKey = <keyof Prisma.DrinkOrderByWithRelationInput>Object.keys(orderBy)[0]
    const cursorKey = <keyof Prisma.DrinkWhereUniqueInput>(sortKey === 'createdAt'
      ? sortKey
      : 'id_name')

    const { orderBy: orderByArg, ...baseArgs } = {
      where: {
        ...(
          userId ? { userId } : {
            OR: [
              { userId: auth?.sub },
              { userId: null },
            ],
          }
        ),
        ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
      },
      orderBy,
    }

    return await findManyCursorConnection<Drink, Prisma.DrinkWhereUniqueInput>(
      (args) => prisma.drink.findMany({ ...args, orderBy: orderByArg, ...baseArgs }),
      () => prisma.drink.count(baseArgs),
      { first, last, after, before },
      {
        getCursor: (record) => {
          const key = cursorKey in record ? [cursorKey] : cursorKey.split('_')

          return cursorKey in record
            ? { [cursorKey]: record[cursorKey as keyof Drink] }
            : { [cursorKey]: key.reduce((acc, item) => ({ ...acc, [item]: record?.[item as keyof Drink] }), {}) }
        },
        encodeCursor: (cursor) => toCursorHash(JSON.stringify(cursor[cursorKey])),
        decodeCursor: (cursorString) => ({ [cursorKey]: JSON.parse(fromCursorHash(cursorString)) }),
      },
    )
  },

  async entries(_, { cursor, limit, drinkId, distinct }, { prisma, req: { auth } }) {
    console.log(distinct)
    const userId = <string>auth?.sub
    const entries = Entries(prisma.entry)

    if (distinct) {
      const { count, entries: rawEntries } = await entries.findAndCountDistinct(
        prisma,
        userId,
        drinkId ? drinkId : undefined,
        limit ? limit : undefined,
        cursor ? cursor : undefined,
      )

      return {
        edges: rawEntries.map(({ id, ...item }) => ({ cursor: id, node: { id, ...item } })),
        pageInfo: {
          endCursor: rawEntries[rawEntries.length - 1].id,
          hasNextPage: count > (limit ?? 0),
        },
      }
    } else {
      const args: Prisma.EntryFindManyArgs & Prisma.EntryCountArgs = {
        ...(cursor ? {
          skip: 1,
          cursor: { id: cursor },
        } : {}),
        where: {
          AND: [
            { drinkId: <string>drinkId },
            { userId },
          ],
        },
      }

      const count = await prisma.entry.count({
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        where: {
          AND: [
            { drinkId: <string>drinkId },
            { userId: <string>userId },
          ],
        },
        orderBy: [
          { timestamp: 'desc' },
          { userId: 'desc' },
        ],
      })

      const foundEntries = await entries
        .findWithNutrition({
          include: {
            drink: {
              select: {
                caffeine: true,
                sugar: true,
                coefficient: true,
              },
            },
          },
          ...(limit ? { take: limit } : {}),
          orderBy: {
            timestamp: 'desc',
          },
          ...args,
        })

      const lastId = foundEntries[foundEntries.length - 1].id
      return {
        edges: foundEntries
          .map(({ id, ...rest }) => ({ cursor: id, node: { ...rest, id }})),
        pageInfo: {
          hasNextPage: count > foundEntries.length,
          endCursor: lastId,
        },
      }
    }

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

  async drinksHistory(_, { limit, cursor }, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub

    type RawEntry = {
      id: string,
      drink: Drink,
      count: number,
      total_volume: number,
      water_volume: number,
      last_entry: Date,
    }

    const entries = <RawEntry[]>await prisma.$queryRaw`
    SELECT
      row_to_json(d) AS drink,
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

    return {
      edges: entries.map(({
          water_volume: waterVolume,
          total_volume: totalVolume,
          last_entry: lastEntry,
          drink: { id, ...drink },
          ...entry
        }) => ({
          node: {
            waterVolume,
            totalVolume,
            lastEntry,
            drink: { id, ...drink },
            ...entry,
          },
          cursor: id,
          }),
        ),
      pageInfo: {
        endCursor: '123',
        hasNextPage: false,
      },
    }
  },

  async me(parent, args, { prisma, req }) {
    const userId = <string>req.auth?.sub
    return await prisma.user.findUnique({ where: { id: userId }})
  },

  async user(parent, { userId }, { prisma }) {
    return await prisma.user.findUnique({ where: { id: userId } })
  },

  async users(parent, args, { prisma }) {
    return await prisma.user.findMany()
  },
}

