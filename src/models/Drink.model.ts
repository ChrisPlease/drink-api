import { PrismaClient, Drink } from '@prisma/client'

type DrinkInput = {
  name: string,
  icon: string,
  userId: string,
}

type Ingredient = {
  drinkId: string,
  parts: number,
}

export function Drinks(prismaDrink: PrismaClient['drink'], client: PrismaClient) {
  return Object.assign(prismaDrink, {
    async createWithIngredients(data: DrinkInput, ingredients: Ingredient[]): Promise<Drink> {
      const { id } = await prismaDrink.create({
        data: {
          ...data,
          ingredients: {
            create: ingredients,
          },
        },
      })

      const [nutrition] = await client.$queryRaw<{ caffeine: string; sugar: string; coefficient: string }[]>`
      SELECT
        ROUND(SUM((i.parts::float/t.parts)*d.coefficient)::numeric, 2) AS coefficient,
        ROUND(SUM((i.parts::float/t.parts)*d.caffeine)::numeric, 2) AS caffeine,
        ROUND(SUM((i.parts::float/t.parts)*d.sugar)::numeric, 2) AS sugar
      FROM _drink_ingredients di
      INNER JOIN ingredients i ON di."B" = i.id
      INNER JOIN drinks d ON i.drink_id = d.id
      INNER JOIN (
        SELECT di."A" AS drink_id,	SUM(i.parts) AS parts FROM ingredients i INNER JOIN _drink_ingredients di ON di."B" = i.id GROUP BY di."A"
      ) t ON t.drink_id = di."A"
      WHERE di."A" = ${id}::uuid`

      return await prismaDrink.update({
        where: { id },
        data: {
          caffeine: +nutrition.caffeine,
          sugar: +nutrition.sugar,
          coefficient: +nutrition.coefficient,
        },
      })
    },
  })
}
