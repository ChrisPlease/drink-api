import { PrismaClient, Drink } from '@prisma/client'
import { DrinkCreateInput, IngredientInput } from '../__generated__/graphql'
import { fromCursorHash, toCursorHash } from '../utils/cursorHash'

export function Drinks(prismaDrink: PrismaClient['drink']) {
  return Object.assign(prismaDrink, {
    async createWithIngredients({
      /* eslint-disable @typescript-eslint/no-unused-vars */
      coefficient: _,
      caffeine: __,
      sugar: ___,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...data
    }: DrinkCreateInput & { userId: string },
    drinkIngredients: IngredientInput[],
    client: PrismaClient,
    ): Promise<Drink> {
      const ingredients = drinkIngredients.map(({ drinkId, parts }) => ({
        drinkId: fromCursorHash(drinkId).split(':')[1],
        parts,
      }))

      const { id } = await prismaDrink.create({
        data: {
          ...data,
          ingredients: {
            create: ingredients
              .map(ingredient => ({ ingredient: { create: ingredient } })),
          },
        },
      })

      type Nutrition = {
        caffeine: string,
        sugar: string,
        coefficient: string,
      }

      const [{
        sugar,
        caffeine,
        coefficient,
      }] = await client.$queryRaw<Nutrition[]>`
      SELECT
        ROUND(SUM((i.parts::float/t.parts)*d.coefficient)::numeric, 2) AS coefficient,
        ROUND(SUM((i.parts::float/t.parts)*d.caffeine)::numeric, 2) AS caffeine,
        ROUND(SUM((i.parts::float/t.parts)*d.sugar)::numeric, 2) AS sugar
      FROM drink_ingredients di
      INNER JOIN ingredients i ON di.ingredient_id = i.id
      INNER JOIN drinks d ON i.drink_id = d.id
      INNER JOIN (
        SELECT
          di.drink_id AS drink_id,
          SUM(i.parts) AS parts
        FROM ingredients i
        INNER JOIN drink_ingredients di ON di.ingredient_id = i.id GROUP BY di.drink_id
      ) t ON t.drink_id = di.drink_id
      WHERE di.drink_id = ${id}::uuid`

      return await prismaDrink.update({
        where: { id },
        data: {
          caffeine: +caffeine,
          sugar: +sugar,
          coefficient: +coefficient,
        },
      }).then(({ id, ...rest }) => ({
        id: toCursorHash(`MixedDrink:${id}`),
        ...rest,
      }))
    },
  })
}
