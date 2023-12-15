/* istanbul ignore file -- @preserve  */

import { Prisma, Drink, PrismaClient } from '@prisma/client'
import { NutritionQuery } from '../types/models'
import { RawDrink, RawEntry } from '../types/queries'


/**
 * Retrieve the nutrition of a drink based on drink ingredients
 *
 * @param {PrismaClient} client - The prisma client
 * @param {string} drinkId - the ID of the queried drink
 * @return {Promise<NutritionQuery[]>} - Promise containing an array of one drink nutrition
 */
export const queryIngredientNutrition = async (
  client: PrismaClient,
  drinkId: string,
): Promise<NutritionQuery[]> => {
  return await client.$queryRaw<NutritionQuery[]>`
SELECT \
ROUND(SUM((i.parts/t_i.parts)*i_n.coefficient)::numeric,2) AS coefficient,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.calories)::numeric,2) AS calories,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.saturated_fat)::numeric,2) AS saturated_fat,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.total_fat)::numeric,2) AS total_fat,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.cholesterol)::numeric,2) AS cholesterol,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.sodium)::numeric,2) AS sodium,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.carbohydrates)::numeric,2) AS carbohydrates,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.fiber)::numeric,2) AS fiber,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.sugar)::numeric,2) AS sugar,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.added_sugar)::numeric,2) AS added_sugar,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.protein)::numeric,2) AS protein,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.potassium)::numeric,2) AS potassium,\
ROUND(SUM(i.parts/t_i.parts*p_n.metric_size/i_n.metric_size*i_n.caffeine)::numeric,2) AS caffeine \
FROM drink_ingredients di \
INNER JOIN nutrition p_n ON p_n.drink_id = di.drink_id \
INNER JOIN ingredients i ON di.ingredient_id = i.id \
INNER JOIN nutrition i_n ON i_n.drink_id = i.drink_id \
INNER JOIN (\
SELECT \
di.drink_id AS drink_id,\
SUM(i.parts) AS parts \
FROM ingredients i \
INNER JOIN drink_ingredients di ON di.ingredient_id = i.id GROUP BY di.drink_id\
) t_i ON t_i.drink_id = di.drink_id \
WHERE di.drink_id = ${drinkId}::uuid`
}

export const queryIngredientCount = async (
  client: PrismaClient,
  drinkId: string,
): Promise<RawDrink[]> => {
  return await client.$queryRaw<(Drink & { ingredients: number })[]>`
SELECT \
d.*,\
COUNT(i2) AS ingredients \
FROM ingredients i \
INNER JOIN drinks d ON d.id = i.drink_id \
LEFT JOIN drink_ingredients di ON di.ingredient_id = d.id \
LEFT JOIN ingredients i2 ON di.drink_id = i2.id \
WHERE i.id = ${drinkId}::uuid \
GROUP BY d.id`
}

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

  return client.$queryRaw<RawEntry[]>`
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
  };`}

export const entriesDistinctCount = async (
  client: PrismaClient,
  {
    userId,
    drinkId,
  }: {
    userId: string,
    drinkId?: string,
  },
) => await client.$queryRaw<{ count: string }[]>`
SELECT COUNT(DISTINCT (volume)) FROM entries WHERE user_id = ${
  userId
} AND deleted = false ${
  drinkId ? Prisma.sql`AND drink_id = ${drinkId}::uuid` : Prisma.empty
}
`
