-- @param {String} $1:ingredientId - The id of the drink

SELECT
d.*,
COUNT(i2) AS ingredients
FROM ingredients i
INNER JOIN drinks d ON d.id = i.drink_id
LEFT JOIN drink_ingredients di ON di.ingredient_id = d.id
LEFT JOIN ingredients i2 ON di.drink_id = i2.id
WHERE i.id = $1::uuid
GROUP BY d.id
