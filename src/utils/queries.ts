import { Drink, PrismaClient } from '@prisma/client'
import { NutritionQuery, NutritionResult } from '../types/models'

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
): Promise<(Drink & { ingredients: number })[]> => {
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
