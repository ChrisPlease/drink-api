-- @param {String} $1:userId - The ID of the user
-- @param {Number} $2:defaultLimit - The default limit
-- @param {Number} $3:offset - The offset

SELECT
	drinks.id,
	drinks.name,
	drinks.icon,
	drinks.user_id,
	drinks.created_at,
	drinks.deleted,
	drinks.upc,
	drinks.metric_size,
	drinks.serving_size,
	drinks.serving_unit,
	drinks.brand,
	COALESCE(aggr_selection_0_DrinkIngredients._aggr_count_ingredients, 0) AS _aggr_count_ingredients
FROM drinks
LEFT JOIN (
	SELECT
		entries.drink_id,
		COUNT(*) AS orderby_aggregator
	FROM entries
	WHERE 1=1
	GROUP BY entries.drink_id
) AS orderby_1_Entry ON (drinks.id = orderby_1_Entry.drink_id)
LEFT JOIN (
	SELECT
		drink_ingredients.drink_id,
		COUNT(*) AS _aggr_count_ingredients
	FROM drink_ingredients
	WHERE 1=1 GROUP BY drink_ingredients.drink_id
) AS aggr_selection_0_DrinkIngredients ON (drinks.id = aggr_selection_0_DrinkIngredients.drink_id)
WHERE (
	(
		drinks.user_id = $1 OR drinks.user_id IS NULL
	) AND drinks.deleted IS NULL
) ORDER BY COALESCE(orderby_1_Entry.orderby_aggregator, $2) DESC, drinks.name ASC OFFSET $3
