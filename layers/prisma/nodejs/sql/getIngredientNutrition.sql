-- @param {String} $1:drinkId Drink id
SELECT
ROUND(SUM((i.parts/t_i.parts)*i_n.coefficient)::numeric,2) AS coefficient,
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.calories)::numeric,2) AS calories,
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.saturated_fat)::numeric,2) AS "saturatedFat",
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.total_fat)::numeric,2) AS "totalFat",
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.cholesterol)::numeric,2) AS cholesterol,
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.sodium)::numeric,2) AS sodium,
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.carbohydrates)::numeric,2) AS carbohydrates,
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.fiber)::numeric,2) AS fiber,
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.sugar)::numeric,2) AS sugar,
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.added_sugar)::numeric,2) AS "addedSugar",
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.protein)::numeric,2) AS protein,
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.potassium)::numeric,2) AS potassium,
ROUND(SUM(i.parts/t_i.parts*p.metric_size/i_d.metric_size*i_n.caffeine)::numeric,2) AS caffeine
FROM drink_ingredients di
INNER JOIN drinks p ON p.id = di.drink_id
INNER JOIN ingredients i ON di.ingredient_id = i.id
INNER JOIN nutrition i_n ON i_n.drink_id = i.drink_id
INNER JOIN drinks i_d ON i_d.id = i.drink_id
INNER JOIN (
  SELECT
di.drink_id AS drink_id,
SUM(i.parts) AS parts
FROM ingredients i
INNER JOIN drink_ingredients di ON di.ingredient_id = i.id GROUP BY di.drink_id
) t_i ON t_i.drink_id = di.drink_id
WHERE di.drink_id = $1::uuid
