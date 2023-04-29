import { PrismaClient, Drink } from '@prisma/client'
import { DrinkCreateInput, DrinkEditInput } from '../__generated__/graphql'
import { roundNumber } from '../utils/roundNumber'
import { fromCursorHash, toCursorHash } from '../utils/cursorHash'
import { Nutrition, NutritionQuery } from '../types/models'

export function Drinks(prismaDrink: PrismaClient['drink']) {
  return Object.assign(prismaDrink, {
    async calculateIngredientNutrition(
      drinkId: string,
      client: PrismaClient,
    ): Promise<Nutrition> {
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

    async createWithNutrition({
      caffeine,
      sugar,
      coefficient,
      servingSize,
      userId,
      ...rest
    }: (Omit<DrinkCreateInput, 'ingredients'> & { userId: string })) {

      const nutrition = {
        caffeine: roundNumber(+(caffeine ?? 0) / +(servingSize ?? 1)),
        sugar: roundNumber(+(sugar ?? 0) / +(servingSize ?? 1)),
        coefficient: roundNumber(+(coefficient ?? 0)),
      }

      return await prismaDrink.create({ data: { ...rest, ...nutrition, userId }})
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
      const [,id] = fromCursorHash(drinkId).split(':')

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
        drinkId: fromCursorHash(drinkId).split(':')[1],
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
      const [,id] = fromCursorHash(drinkId).split(':')

      const nutrition = Object.entries({ caffeine, sugar, coefficient })
        .reduce((acc, [key, val]) => {
          if (val) {
            acc[key as keyof Nutrition] = roundNumber(+val / (servingSize ?? 1))
          }
          return acc
        }, {} as Nutrition)

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
