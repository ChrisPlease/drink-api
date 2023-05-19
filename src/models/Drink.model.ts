import { PrismaClient, Drink } from '@prisma/client'
import { DrinkCreateInput, DrinkEditInput } from '../__generated__/graphql'
import { deconstructId, toCursorHash } from '../utils/cursorHash'
import { Nutrition, NutritionQuery } from '../types/models'

export function Drinks(prismaDrink: PrismaClient['drink']) {
  return Object.assign(prismaDrink, {
    async calculateIngredientNutrition(
      drinkId: string,
      client: PrismaClient,
    ): Promise<Omit<Nutrition, 'servingSize'>> {
      const [{
        sugar,
        caffeine,
        coefficient,
      }] = await client.$queryRaw<NutritionQuery[]>`
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
      WHERE di.drink_id = ${drinkId}::uuid`

      return {
        sugar: +sugar,
        caffeine: +caffeine,
        coefficient: +coefficient,
      }
    },

    async createWithNutrition(
      data: (Omit<DrinkCreateInput, 'ingredients'> & { userId: string }),
    ) {
      return await prismaDrink.create({ data })
        .then(({ id, ...rest }) => ({
          id: toCursorHash(`BaseDrink:${id}`),
          ...rest,
        }))
    },

    async createWithIngredients({
      ingredients: drinkIngredients,
      ...data
    }: Omit<DrinkCreateInput, 'caffeine' | 'sugar' | 'coefficient'> & { userId: string },
    client: PrismaClient,
    ): Promise<Drink> {
      const ingredients = (drinkIngredients || []).map(({ drinkId, parts }) => ({
        drinkId: deconstructId(drinkId)[1],
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

      return await this.saveWithIngredientsNutrition(id, client)
    },

    async updateWithIngredients(
      {
        id: drinkId,
        userId,
        ingredients: newIngredients,
        ...data
      }: Omit<DrinkEditInput, 'coefficient' | 'caffeine' | 'sugar'> & { userId: string },
      client: PrismaClient,
    ): Promise<Drink | null> {
      const [,id] = deconstructId(drinkId)

      const oldIngredients = await prismaDrink
        .findUnique({ where: { id, userId } })
        .ingredients({ select: { ingredient: { select: { id: true } } } })
        .then(ingredients => ingredients?.map(
          ({ ingredient: { id }}) => id,
        ))

      await client.ingredient.deleteMany({
        where: { id: { in: oldIngredients } },
      })

      const ingredients = (newIngredients || []).map(({ drinkId, parts }) => ({
        drinkId: deconstructId(drinkId)[1],
        parts,
      }))
      await prismaDrink.update({
        where: {
          id,
          userId,
        },
        data: {
          ...data,
          ingredients: {
            create: ingredients.map(ingredient => ({
              ingredient: { create: ingredient },
            })),
          },
        },
      })

      return await this.saveWithIngredientsNutrition(id, client)
    },

    async updateWithNutrition({
      id: drinkId,
      sugar,
      caffeine,
      servingSize,
      coefficient,
      userId,
      ...data
    }: Omit<DrinkEditInput, 'ingredients'> & { userId: string }): Promise<Drink | null> {
      const [,id] = deconstructId(drinkId)

      const nutrition = Object.entries({ caffeine, sugar, coefficient, servingSize })
        .reduce((acc, [key, val]) => (val ? { [key]: val, ...acc } : acc), {} as Nutrition)

      return await prismaDrink.update({ where: { id }, data: { ...data, ...nutrition, userId } })
        .then(({ id, ...rest }) => ({
          id: toCursorHash(`BaseDrink:${id}`),
          ...rest,
        }))
    },

    async saveWithIngredientsNutrition(id: string, client: PrismaClient): Promise<Drink> {
      const {
        sugar,
        caffeine,
        coefficient,
      } = await this.calculateIngredientNutrition(id, client)

      return await prismaDrink.update({
        where: { id },
        data: { caffeine, sugar, coefficient },
      })
      .then(({ id, ...rest }) => ({
        id: toCursorHash(`MixedDrink:${id}`),
        ...rest,
      }))
    },
  })
}
