import { PrismaClient, Drink, Prisma } from '@prisma/client'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import { roundNumber } from '@/utils/roundNumber'
import { deconstructId, toCursorHash } from '@/utils/cursorHash'
import { QueryDrinksHistoryArgs } from '@/__generated__/graphql'
import { DrinkHistory } from '@/types/models'

export function DrinkHistory(client: PrismaClient) {
  return Object.assign({}, {
    async findUniqueDrinkHistory(
      drinkHistoryId: string,
      userId: string,
    ): Promise<DrinkHistory> {
      const [,id] = deconstructId(drinkHistoryId)
      return await client.$transaction(async (tx) => {
        const where = { drinkId: id, userId }
        const entryCount = await tx.entry.groupBy({
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

        const [{
          _count: count,
          _max: max,
          _sum: sum,
        }] = entryCount.length ? entryCount : [{ _count: 0, _max: { timestamp: null }, _sum: { volume: 0 } }]

        const {
          coefficient,
        } = await tx.drink.findUnique({
          where: { id },
        }).nutrition() || { coefficient: 1 }

        const totalVolume = sum.volume || 0
        const lastEntry = max.timestamp

        return {
          id: toCursorHash(`DrinkHistory:${id}`),
          count,
          volume: totalVolume,
          water: roundNumber(totalVolume * ((coefficient || 1) / 100)),
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
    const {
      hasEntries,
      limit,
      search,
    } = filter || { hasEntries: false, limit: null, search: undefined }

    type RawDrink = Pick<Drink, 'id'> & {
      ingredients: number,
    }

    type RawEntry = {
      id: string,
      drink: RawDrink,
      count: number,
      total_volume: number,
      water_volume: number,
    }

    const rawSearch = search ? `%${search}%` : ''

    return await findManyCursorConnection(
      async (args): Promise<DrinkHistory[]> => {
        const { take, cursor } = args
        const [,id] = deconstructId(cursor?.id || '')

        return client.$queryRaw<RawEntry[]>`
        WITH cte AS (
          SELECT
            row_number() OVER (
              ORDER BY CASE WHEN e.timestamp IS NULL THEN 1 ELSE 0 END, e.timestamp DESC
            ) as row_idx,
            d.id,
            row_to_json(d) AS drink,
            e.count,
            e.water_volume,
            e.total_volume,
            e.timestamp
          FROM (
            SELECT
              drinks.name,
              drinks.id,
              COUNT(di) AS ingredients
            FROM drinks
            LEFT JOIN drink_ingredients di ON drinks.id = di.drink_id
            WHERE drinks.deleted IS NULL
            GROUP BY drinks.id
          ) d
          ${
            hasEntries
              ? Prisma.sql`INNER`
              : Prisma.sql`LEFT`
          } JOIN (
            SELECT
              n.drink_id AS drink_id,
              COALESCE(COUNT(e)::int,0) AS count,
              COALESCE(SUM(e.volume),0) AS total_volume,
              ROUND(COALESCE(SUM(e.volume*(n.coefficient/100))::int,0),1) AS water_volume,
              MAX(e.timestamp) AS timestamp
            FROM nutrition n
            INNER JOIN drinks d ON d.id = n.drink_id
            ${
              hasEntries
                ? Prisma.sql`INNER`
                : Prisma.sql`LEFT`
            } JOIN entries e ON e.drink_id = n.drink_id AND e.user_id = ${userId}
            ${
              limit
                ? Prisma.sql`WHERE e.timestamp IS NULL OR e.timestamp BETWEEN ${limit} AND now()`
                : Prisma.empty
            }
            GROUP BY n.drink_id
          ) e ON e.drink_id = d.id
          ${search ? Prisma.sql`WHERE d.name ILIKE ${rawSearch}` : Prisma.empty}
          )

          SELECT
            c.id,
            c.drink,
            c.count,
            c.water_volume,
            c.total_volume
          FROM cte c ${cursor
            ? Prisma.sql`INNER JOIN cte AS c2 ON (c2.id = ${id}::uuid AND c.row_idx > c2.row_idx)`
            : Prisma.empty
          }
          ${
            limit
              ? Prisma.sql`WHERE c.timestamp BETWEEN ${limit} AND now()`
              : Prisma.empty
          }
          ORDER BY c.row_idx ASC ${
            take ? Prisma.sql`LIMIT ${take}` : Prisma.empty
          };`
        .then(query => query.map(({
          water_volume: water,
          total_volume: volume,
          drink: {
            id: drinkId,
            ingredients,
          },
          id,
          ...entry
        }) => ({
          id: toCursorHash(`DrinkHistory:${id}`),
          water,
          volume,
          drink: {
            id: toCursorHash(`${ingredients > 0 ? 'Mixed' : 'Base'}Drink:${drinkId}`),
          } as Drink,
          ...entry,
        })))
      },
      () => client.drink.count(),
      { first, last, before, after },
    )
    },
  })
}
