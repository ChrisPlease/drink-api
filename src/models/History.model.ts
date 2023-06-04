import { PrismaClient, Drink, Prisma } from '@prisma/client'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import { roundNumber } from '@/utils/roundNumber'
import { deconstructId, toCursorHash } from '@/utils/cursorHash'
import { QueryDrinksHistoryArgs } from '@/__generated__/graphql'

export function DrinkHistory(client: PrismaClient) {
  return Object.assign({}, {
    async findUniqueDrinkHistory(
      drinkHistoryId: string,
      userId: string,
    ) {
      const [,id] = deconstructId(drinkHistoryId)
      return await client.$transaction(async (tx) => {
        const where = { drinkId: id, userId }
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
          id: drinkId,
          _count: { ingredients },
          ...drink
        } = <Drink & { _count: { ingredients: number } }>await tx.drink.findUnique({
          where: { id },
          include: {
            _count: { select: { ingredients: true } },
          },
        })

        const totalVolume = sum.volume || 0
        const lastEntry = max.timestamp

        return {
          id: toCursorHash(`DrinkHistory:${id}`),
          drink: { id: toCursorHash(`${
            ingredients > 0 ? 'Mixed' : 'Base'
          }Drink:${drinkId}`), ...drink },
          count,
          totalVolume,
          waterVolume: roundNumber(totalVolume * (drink?.coefficient || 0)),
          lastEntry,
        }
      })
    },

    async findManyPaginated(
      baseArgs: QueryDrinksHistoryArgs & { userId: string },
    ) {
      const {
        first,
        after,
        last,
        before,
        filter,
        userId,
      } = baseArgs

    const { hasEntries } = filter || { hasEntries: false }

    type RawDrink = Omit<Drink, 'servingSize' | 'createdAt'> & {
      ingredients: number,
      serving_size: number,
      created_at: Date,
    }

    type RawEntry = {
      id: string,
      drink: RawDrink,
      count: number,
      total_volume: number,
      water_volume: number,
      last_entry: Date,
    }

    return await findManyCursorConnection(
      async (args) => {
        const { take, cursor } = args
        const [,id] = deconstructId(cursor?.id || '')
        return client.$queryRaw<RawEntry[]>`
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
          ${hasEntries ? Prisma.sql`INNER` : Prisma.sql`LEFT`} JOIN (
            SELECT
              d.id AS drink_id,
              COALESCE(COUNT(e)::int,0) AS count,
              COALESCE(SUM(e.volume),0) AS total_volume,
              COALESCE(SUM(e.volume*d.coefficient),0) AS water_volume,
              MAX(e.timestamp) AS last_entry
            FROM drinks d
            ${hasEntries ? Prisma.sql`INNER` : Prisma.sql`LEFT`} JOIN entries e ON e.drink_id = d.id AND e.user_id = ${userId}
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
          drink: {
            id: drinkId,
            ingredients,
            created_at: createdAt,
            serving_size: servingSize,
            ...drink
          },
          id,
          ...entry
        }) => ({
          id: toCursorHash(`DrinkHistory:${id}`),
          waterVolume,
          totalVolume,
          lastEntry,
          drink: {
            id: toCursorHash(`${ingredients > 0 ? 'Mixed' : 'Base'}Drink:${drinkId}`),
            servingSize,
            createdAt,
            ...drink,
          },
          ...entry,
        })))
      },
      () => client.drink.count(),
      { first, last, before, after },
    )
    },
  })
}
