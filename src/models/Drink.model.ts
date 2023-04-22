import { PrismaClient, Drink } from '@prisma/client'
import { DrinkInput, IngredientInput } from '../__generated__/graphql'
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
    }: DrinkInput & { userId: string },
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
          ingredients: { create: ingredients },
        },
      })

      const [{
        sugar,
        caffeine,
        coefficient,
      }] = await client.$queryRaw<{ caffeine: string; sugar: string; coefficient: string }[]>`
      SELECT
        ROUND(SUM((i.parts::float/t.parts)*d.coefficient)::numeric, 2) AS coefficient,
        ROUND(SUM((i.parts::float/t.parts)*d.caffeine)::numeric, 2) AS caffeine,
        ROUND(SUM((i.parts::float/t.parts)*d.sugar)::numeric, 2) AS sugar
      FROM _drink_ingredients di
      INNER JOIN ingredients i ON di."B" = i.id
      INNER JOIN drinks d ON i.drink_id = d.id
      INNER JOIN (
        SELECT
          di."A" AS drink_id,
          SUM(i.parts) AS parts
        FROM ingredients i
        INNER JOIN _drink_ingredients di ON di."B" = i.id GROUP BY di."A"
      ) t ON t.drink_id = di."A"
      WHERE di."A" = ${id}::uuid`

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
