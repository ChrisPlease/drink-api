import { QueryResolvers } from '../__generated__/graphql'
import { Entries } from '../models/Entry.model'
import { Drink, Entry, Prisma } from '@prisma/client'
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

  async entries(
    _,
    {
      first,
      sort,
      last,
      before,
      after,
      drinkId,
      distinct,
    }, { prisma, req: { auth } }) {

    const entries = Entries(prisma.entry)

    return await entries.findManyPaginated(
      prisma,
      {
        sort,
        drinkId,
        distinct,
      },
      { first, last, before, after },
      <string>auth?.sub,
    )
    // const orderBy = <Prisma.EntryOrderByWithRelationInput>(
    //   sort
    //     ? Object.keys(sort)[0] === 'drink'
    //       ? { drink: { name: sort.drink } } : sort
    //     : { drink: { name: 'desc' } }
    // )

    // const sortKey = Object.keys(orderBy)[0]
    // let cursorKey = sortKey

    // switch (sortKey) {
    //   case 'volume':
    //     cursorKey += '_id'
    //     break
    //   case 'drink':
    //     cursorKey += 'Id_id'
    //     break
    //   default:
    //     break
    // }

    // const userId = <string>auth?.sub
    // const entries = Entries(prisma.entry)

    // const { orderBy: orderByArg, ...baseArgs }: Prisma.EntryFindManyArgs = {
    //   where: {
    //     AND: [
    //       { drinkId: <string>drinkId },
    //       { userId },
    //     ],
    //   },
    //   orderBy,
    // }

    // if (distinct) {
    //   baseArgs.distinct = 'volume'
    // }

    // return await findManyCursorConnection<Entry, Prisma.EntryWhereUniqueInput>(
    //   (args) => entries.findWithNutrition({ ...args, orderBy: orderByArg, ...baseArgs }),
    //   async () => {
    //     let count = 0
    //     if (distinct) {
    //       ([{ count }] = await prisma.$queryRaw<{ count: number }[]>`
    //       SELECT COUNT(DISTINCT (volume)) FROM entries WHERE user_id = ${userId} ${
    //         drinkId ? Prisma.sql`AND drink_id = ${drinkId}::uuid` : Prisma.empty
    //       }
    //       `)
    //     } else {
    //       count = await prisma.entry.count(
    //         { ...baseArgs } as Omit<Prisma.EntryFindManyArgs, 'select' | 'include'>,
    //       )
    //     }
    //     return count
    //   },
    //   { first, last, before, after },
    //   {
    //     getCursor(record) {
    //       const key = cursorKey in record ? [cursorKey] : cursorKey.split('_')
    //       return cursorKey in record
    //         ? { [cursorKey]: record[cursorKey as keyof Entry] }
    //         : {
    //           [cursorKey]: key
    //             .reduce(
    //               (acc, item) => ({ ...acc, [item]: record?.[item as keyof Entry] }), {},
    //             ),
    //           }
    //     },
    //     encodeCursor: (cursor) => toCursorHash(
    //       JSON.stringify(cursor[cursorKey as keyof Prisma.EntryWhereUniqueInput]),
    //     ),
    //     decodeCursor: (cursorString) => (
    //       { [cursorKey]: JSON.parse(fromCursorHash(cursorString)) }
    //     ),
    //   },
    // )

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
      id: drinkId,
      drink,
      count,
      totalVolume,
      waterVolume: roundNumber(totalVolume * (drink?.coefficient || 0)),
      lastEntry,
    }
  },

  async drinksHistory(
    _,
    {
      first,
      after,
      last,
      before,
    }, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub

    type RawEntry = {
      id: string,
      drink: Drink,
      count: number,
      total_volume: number,
      water_volume: number,
      last_entry: Date,
    }

    return await findManyCursorConnection(
      async (args) => {
        const { take, cursor } = args
        console.log(args)
        return prisma.$queryRaw<RawEntry[]>`
        WITH cte AS (
          SELECT
            row_number() OVER (
              ORDER BY CASE WHEN e.last_entry IS NULL THEN 1 ELSE 0 END, e.last_entry DESC
            ) as row_idx,
            d.id,
            row_to_json(d) AS drink,
            e.count,
            e.water_volume,
            e.total_volume,
            e.last_entry
          FROM drinks d
          LEFT JOIN (
            SELECT
              d.id AS drink_id,
              COALESCE(COUNT(e)::int,0) AS count,
              COALESCE(SUM(e.volume),0) AS total_volume,
              COALESCE(SUM(e.volume*d.coefficient),0) AS water_volume,
              MAX(e.timestamp) AS last_entry
            FROM drinks d
            LEFT JOIN entries e ON e.drink_id = d.id AND e.user_id = ${userId}
            GROUP BY d.id
          ) e ON e.drink_id = d.id)

          SELECT
            c.id,
            c.drink,
            c.count,
            c.water_volume,
            c.total_volume,
            c.last_entry
          FROM cte c
          ORDER BY CASE WHEN c.last_entry IS NULL THEN 1 ELSE 0 END, c.last_entry DESC ${cursor
            ? Prisma.sql`INNER JOIN cte AS c2 ON (c2.id = ${cursor.id}::uuid AND c.row_idx > c2.row_idx)`
            : Prisma.empty
          } ${
            take ? Prisma.sql`LIMIT ${take}` : Prisma.empty
          };`
        .then(query => query.map(({
          water_volume: waterVolume,
          total_volume: totalVolume,
          last_entry: lastEntry,
          drink: { id, ...drink },
          ...entry
        }) => ({
          waterVolume,
          totalVolume,
          lastEntry,
          drink: { id, ...drink },
          ...entry,
        })))
      },
      () => prisma.drink.count(),
      { first, last, before, after },
    )

    // console.log('fooooo', foo)

    // return {
    //   edges: entries.map(({
    //       water_volume: waterVolume,
    //       total_volume: totalVolume,
    //       last_entry: lastEntry,
    //       drink: { id, ...drink },
    //       ...entry
    //     }) => ({
    //       node: {
    //         waterVolume,
    //         totalVolume,
    //         lastEntry,
    //         drink: { id, ...drink },
    //         ...entry,
    //       },
    //       cursor: id,
    //       }),
    //     ),
    //   pageInfo: {
    //     endCursor: '123',
    //     hasNextPage: false,
    //   },
    // }
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

