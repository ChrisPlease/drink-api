import { PrismaClient, Drink, Prisma } from '@prisma/client'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import {
  DrinkCreateInput,
  DrinkEditInput,
  IngredientInput,
  QueryDrinksArgs,
} from '@/__generated__/graphql'
import {
  deconstructId,
  toCursorHash,
  getCursor,
  encodeCursor,
  fromCursorHash,
} from '@/utils/cursorHash'
import { Nutrition, NutritionQuery } from '@/types/models'

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>

export function Drinks(prismaDrink: PrismaClient['drink']) {
  return Object.assign(prismaDrink, {
    async findUniqueById(drinkId: string) {
      const [__typename,id] = deconstructId(drinkId)
      const res = await prismaDrink.findUnique({ where: { id } }) || null

      return res ? { ...res, id: drinkId } : null
    },

    async findManyPaginated({
      sort,
      userId,
      search,
      first,
      last,
      before,
      after,
    }: QueryDrinksArgs & { userId: string }) {
      const orderBy = <Prisma.DrinkOrderByWithRelationInput>(
        sort ? sort : { name: 'asc' }
      )

      const sortKey = <keyof Prisma.DrinkOrderByWithRelationInput>Object.keys(orderBy)[0]
      const cursorKey = <keyof Prisma.DrinkWhereUniqueInput>(
        sortKey === 'createdAt' ? sortKey : 'id_name'
      )

      const { include, orderBy: orderByArg, ...baseArgs } = {
        where: {
          ...(
            userId ? { userId } : {
              OR: [
                { userId },
                { userId: null },
              ],
            }
          ),
          ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
        },
        include: {
          _count: {
            select: { ingredients: true },
          },
        },
        orderBy,
      }

      return await findManyCursorConnection<Drink, Prisma.DrinkWhereUniqueInput>(
        (args) => prismaDrink
          .findMany({ ...args, include, orderBy: orderByArg, ...baseArgs })
          .then(drinks => drinks.map(({ _count, id, ...drink }) => ({
            id: toCursorHash(`${
              _count.ingredients > 0 ? 'MixedDrink' : 'BaseDrink'
            }:${id}`),
            ...drink,
          }))),
        () => prismaDrink.count(baseArgs),
        { first, last, after, before },
        {
          getCursor: (record) => getCursor<Drink, Prisma.DrinkWhereUniqueInput>(record, cursorKey),
          encodeCursor: (cursor) => {
            const dehashedCursor = encodeCursor(cursor, ['id'])
            return toCursorHash(JSON.stringify(dehashedCursor))
          },
          decodeCursor: (cursorString) => JSON.parse(fromCursorHash(cursorString)),
        },
      )
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
      const ingredients = mapToInputIngredients(drinkIngredients || [])

      const { id } = await prismaDrink.create({
        data: {
          ...data,
          ingredients: { create: ingredients },
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

      const ingredients = mapToInputIngredients(newIngredients)

      await prismaDrink.update({
        where: {
          id,
          userId,
        },
        data: {
          ...data,
          ingredients: { create: ingredients },
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

    async calculateIngredientNutrition(
      drinkId: string,
      client: TransactionClient,
    ): Promise<Omit<Nutrition, 'servingSize'>> {
      const [{
        sugar,
        caffeine,
        coefficient,
      }] = await client.$queryRaw<NutritionQuery[]>`
      SELECT
        ROUND(SUM((i.parts::float/t.parts)*d.coefficient)::numeric, 2) AS coefficient,
        ROUND(SUM(((d2.serving_size*(i.parts::float/t.parts))/d.serving_size)*d.caffeine)::numeric, 2) AS caffeine,
        ROUND(SUM(((d2.serving_size*(i.parts::float/t.parts))/d.serving_size)*d.sugar)::numeric, 2) AS sugar
      FROM drink_ingredients di
      INNER JOIN ingredients i ON di.ingredient_id = i.id
      INNER JOIN drinks d ON i.drink_id = d.id
      INNER JOIN drinks d2 ON d2.id = di.drink_id
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

    async saveWithIngredientsNutrition(
      id: string,
      client: PrismaClient,
    ): Promise<Drink> {
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

function mapToInputIngredients(
  ingredients?: IngredientInput[],
): Prisma.DrinkIngredientsCreateWithoutDrinkInput[] {
  return (ingredients || []).map(({ drinkId, parts }) => ({
    ingredient: { create: { drinkId, parts } },
  }))
}
