/* istanbul ignore file -- @preserve  */
import { Prisma, PrismaClient } from '/opt/nodejs/node_modules/.prisma/client'
import { RawEntry } from '../types/queries'

/**
 * Retrieve a drink's entry history including volume and water
 *
 * @param {PrismaClient} client - The prisma client
 * @param {{
 *   id: string,
 *   hasEntries: boolean,
 *   limit?: number,
 *   userId?: string,
 * }}
 *
 * @return {Promise<RawEntry[]>}
 */
export const queryDrinkHistory = async (
  client: PrismaClient,
  {
    id,
    hasEntries,
    limit,
    userId,
    search,
    cursor,
    take,
  }: {
    id: string,
    hasEntries?: boolean,
    limit?: Date | null,
    userId?: string,
    search?: string,
    cursor?: string,
    take?: number,
  },
) => {

  const rawSearch = search ? `%${search}%` : ''

  return client.$queryRaw<RawEntry[]>(Prisma.sql`
WITH cte AS (
  SELECT
    row_number() OVER (
      ORDER BY CASE WHEN e.timestamp IS NULL THEN 1 ELSE 0 END, e.timestamp DESC
    ) as row_idx,
    d.id,
    d.name,
    e.count,
    e.water_volume,
    e.total_volume,
    e.timestamp
  FROM (
    SELECT
      drinks.name,
      drinks.id
    FROM drinks
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
  };`)}

export const entriesDistinctCount = async (
  client: PrismaClient,
  {
    userId,
    drinkId,
  }: {
    userId: string,
    drinkId?: string,
  },
) => await client.$queryRaw<{ count: string }[]>(Prisma.sql`
SELECT COUNT(DISTINCT (volume::int)) FROM entries WHERE user_id = ${
  userId
} AND deleted = false ${
  drinkId ? Prisma.sql`AND drink_id = ${drinkId}::uuid` : Prisma.empty
}
`)
