import { QueryResolvers } from '../__generated__/graphql'
import { Entries } from '../models/Entry.model'
import { DrinkHistory } from '../types/models'
import { DrinkHistory as DrinkHistoryModel } from '../models/History.model'
import { Drink, Entry, Prisma } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import { toCursorHash, fromCursorHash, encodeCursor } from '../utils/cursorHash'
import { Drinks } from '../models/Drink.model'

type NodeEntry = 'Entry' | 'DrinkResult' | 'BaseDrink' | 'MixedDrink' | 'DrinkHistory'

export const queryResolvers: QueryResolvers = {
  async node(_, { id: argId }, { prisma, req: { auth } }) {
    const [__typename,id] = fromCursorHash(argId).split(':') as [NodeEntry, string]
    const userId = <string>auth?.sub

    let res

    switch (__typename) {
      case 'DrinkResult':
      case 'MixedDrink':
      case 'BaseDrink':
        res = <Drink>await Drinks(prisma.drink).findUnique({ where: { id } })
        break
      case 'DrinkHistory':
        res = <DrinkHistory>await DrinkHistoryModel(prisma).findDrinkHistory({ drinkId: id, userId })
        break
      case 'Entry':
        res = <Entry>await Entries(prisma.entry).findUniqueWithNutrition({ where: { id } })
        break
    }

    const { id: resId, ...rest } = res

    return {
      id: toCursorHash(`${__typename}:${resId}`),
      ...rest,
    }
  },

  async drink(_, { drinkId }, { prisma }) {
    const [,id] = fromCursorHash(drinkId).split(':')
    const drink = await prisma.drink.findUnique({
      where: { id },
    })

    return drink ? { ...drink, id: drinkId } : drink
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

    const { include, orderBy: orderByArg, ...baseArgs } = {
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
      include: {
        _count: {
          select: { ingredients: true },
        },
      },
      orderBy,
    }

    return await findManyCursorConnection<Drink, Prisma.DrinkWhereUniqueInput>(
      async (args) => {
        return await prisma.drink
          .findMany({ ...args, include, orderBy: orderByArg, ...baseArgs })
          .then(drinks => drinks.map(({ _count, id, ...drink }) => ({
            id: toCursorHash(`${
              _count.ingredients > 0 ? 'MixedDrink' : 'BaseDrink'
            }:${id}`),
            ...drink,
          })))
      },
      () => prisma.drink.count(baseArgs),
      { first, last, after, before },
      {
        getCursor: (record) => {
          const key = cursorKey in record ? [cursorKey] : cursorKey.split('_')
          return (cursorKey in record
            ? { [cursorKey]: record[cursorKey as keyof Drink] }
            : { [cursorKey]: key.reduce(
              (acc, item) => ({
                ...acc,
                [item]: record?.[item as keyof Drink],
              }), {}) }) as Prisma.DrinkWhereUniqueInput
        },
        encodeCursor: (cursor) => {
          const dehashedCursor = encodeCursor(cursor, ['id'])
          return toCursorHash(JSON.stringify(dehashedCursor))
        },
        decodeCursor: (cursorString) => JSON.parse(fromCursorHash(cursorString)),
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
      { sort, drinkId, distinct },
      { first, last, before, after },
      <string>auth?.sub,
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
      drink: Drink & { ingredients: number },
      count: number,
      total_volume: number,
      water_volume: number,
      last_entry: Date,
    }

    return await findManyCursorConnection(
      async (args) => {
        const { take, cursor } = args
        const id = fromCursorHash(cursor?.id || '').split(':')[1]
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
          FROM (
            SELECT
              d1.*,
              COUNT(i1) AS ingredients
            FROM drinks d1
            LEFT JOIN drink_ingredients di ON d1.id = di.drink_id
            LEFT JOIN ingredients i1 ON i1.id = di.ingredient_id
            GROUP BY d1.id
          ) d
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
          FROM cte c ${cursor
            ? Prisma.sql`INNER JOIN cte AS c2 ON (c2.id = ${id}::uuid AND c.row_idx > c2.row_idx)`
            : Prisma.empty
          } ORDER BY CASE WHEN c.last_entry IS NULL THEN 1 ELSE 0 END, c.last_entry DESC  ${
            take ? Prisma.sql`LIMIT ${take}` : Prisma.empty
          };`
        .then(query => query.map(({
          water_volume: waterVolume,
          total_volume: totalVolume,
          last_entry: lastEntry,
          drink: { id: drinkId, ingredients, ...drink },
          id,
          ...entry
        }) => ({
          id: toCursorHash(`DrinkHistory:${id}`),
          waterVolume,
          totalVolume,
          lastEntry,
          drink: { id: toCursorHash(`${ingredients > 0 ? 'Mixed' : 'Base'}Drink:${drinkId}`), ...drink },
          ...entry,
        })))
      },
      () => prisma.drink.count(),
      { first, last, before, after },
    )
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

