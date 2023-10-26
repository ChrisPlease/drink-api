import { PrismaClient, Drink, Prisma } from '@prisma/client'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import {
  DrinkCreateInput,
  DrinkEditInput,
  IngredientInput,
  MutationDrinkDeleteArgs,
  NumberFilter,
  QueryDrinksArgs,
} from '@/__generated__/graphql'
import { roundNumber } from '@/utils/roundNumber'
import {
  deconstructId,
  toCursorHash,
  getCursor,
  encodeCursor,
  fromCursorHash,
} from '@/utils/cursorHash'
import { Nutrition, NutritionQuery } from '@/types/models'

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export function Drinks(prismaDrink: PrismaClient['drink']) {
  return Object.assign(prismaDrink, {
    async findUniqueById(drinkId: string) {
      const [,id] = deconstructId(drinkId)
      const res = await prismaDrink.findUnique({ where: { id } })
      return res ? { ...res, id: drinkId } : null
    },

    async findManyPaginated({
      filter: filterInput,
      sort,
      userId,
      first,
      last,
      before,
      after,
    }: QueryDrinksArgs,
    reqUser?: string,
    ) {

      const {
        search,
        coefficient,
        caffeine,
        sugar,
        isMixedDrink,
      } = filterInput || {}

      function rangeFilter(filters: NumberFilter[]): Prisma.FloatNullableFilter<'Drink'> {
        return filters.reduce((acc, { comparison, value }) => ({ ...acc, [comparison]: value }), {})
      }

      const filter = {
        ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
        ...(coefficient ? { coefficient: rangeFilter(coefficient) } : {}),
        ...(caffeine ? { caffeine: rangeFilter(caffeine) } : {}),
        ...(sugar ? { sugar: rangeFilter(sugar) } : {}),
        ...(
          (isMixedDrink !== undefined)
            ? isMixedDrink ? { ingredients: { some: {} } } : { ingredients: { none: {} } }
            : {}
          ),
      }

      const where: Prisma.DrinkWhereInput = {
        ...(
          userId ? { userId } : {
            OR: [
              { userId: reqUser },
              { userId: null },
            ],
          }
        ),
        ...filter,
        deleted: null,
      }

      const [
        sortKey,
        sortValue,
      ] = <[keyof Prisma.DrinkOrderByWithRelationInput, string]>Object.entries(sort || {
        name: 'asc',
      })[0]

      const orderBy = <Prisma.DrinkOrderByWithRelationInput>(
        ['name', 'createdAt'].includes(sortKey)
          ? { [sortKey]: sortValue }
          : ([{ [sortKey]: (sortKey === 'entries' ? { _count: sortValue } : sortValue) }, { name: 'asc' }])
      )

      const cursorKey = <keyof Prisma.DrinkWhereUniqueInput>(
        ['name', 'createdAt', 'entries'].includes(sortKey)
          ? sortKey === 'name' ? 'id' : 'createdAt'
          : `id_${sortKey}`
      )

      const { include, orderBy: orderByArg, ...baseArgs } = {
        where,
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
          encodeCursor: (cursor) => toCursorHash(JSON.stringify(encodeCursor(cursor, ['id']))),
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

      return await client.$transaction(async (tx) => {

        const { id } = await tx.drink.create({
          data: {
            ...data,
            ingredients: { create: ingredients },
          },
        })

        return await this.saveWithIngredientsNutrition(id, tx)
      })

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

      return await client.$transaction(async (tx) => {
        const oldIngredients = await tx.drink
          .findUnique({ where: { id_userId: { id, userId } } })
          .ingredients({ select: { ingredient: { select: { id: true } } } })
          .then(ingredients => ingredients?.map(
            ({ ingredient: { id }}) => id,
          ))

        await tx.ingredient.deleteMany({
          where: { id: { in: oldIngredients } },
        })

        const ingredients = mapToInputIngredients(newIngredients)

        await tx.drink.update({
          where: {
            id_userId: { id, userId },
          },
          data: {
            ...data,
            ingredients: { create: ingredients },
          },
        })

        return await this.saveWithIngredientsNutrition(id, tx)
      })

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

    async findDrinkEntries(
      client: PrismaClient,
      drinkId: string,
      userId: string,
    ) {
      const [,id] = deconstructId(drinkId)

      const [entries, drink] = await client.$transaction([
        prismaDrink.findUnique({
          where: { id },
        }).entries({
          where: { userId },
          orderBy: {
            timestamp: 'desc',
          },
        }),
        prismaDrink.findUnique({
          where: { id },
          select: {
            caffeine: true,
            sugar: true,
            coefficient: true,
            servingSize: true,
          },
        }),
      ])

      const {
        caffeine,
        sugar,
        coefficient,
        servingSize,
      } = <Drink>drink

      return entries?.map(({ volume, ...entry }) => {
        const nutrition: { caffeine: number; waterContent: number; sugar: number } = {
          caffeine: roundNumber((caffeine ?? 0) * (volume / servingSize)),
          waterContent: roundNumber((coefficient ?? 0) * (volume / servingSize)),
          sugar: roundNumber((sugar ?? 0) * (volume / servingSize)),
        }

        return {
          volume,
          ...nutrition,
          ...entry,
          id: toCursorHash(`Entry:${entry.id}`),
        }
      }) || []
    },

    async deleteDrink(
      { drinkId, userId }: MutationDrinkDeleteArgs & { userId: string },
    ) {
      const [,id] = deconstructId(drinkId)
      return await prismaDrink.delete({ where: { id_userId: { id, userId } } })
        .then(res => ({ ...res, id: drinkId }))
    },

    async findDrinkIngredients(
      drinkId: string,
    ) {

    const [,id] = deconstructId(drinkId)
    const ingredients = await prismaDrink.findUnique({
      where: { id },
    }).ingredients({ include: { ingredient: true } })
      .then(ingredients => ingredients?.map(({ ingredient }) => ingredient))

    return ingredients || []
    },

    async findDrinkUser(userId: string) {
      const [,id] = deconstructId(userId)
      const user = await prismaDrink.findUnique({
        where: { id },
      }).user()
      return user ? { ...user, id: toCursorHash(`User:${user.id}`) } : null
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
      client: TransactionClient,
    ): Promise<Drink> {
      const {
        sugar,
        caffeine,
        coefficient,
      } = await this.calculateIngredientNutrition(id, client)

      return await client.drink.update({
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
    ingredient: {
      create: {
        drinkId: deconstructId(drinkId || '')?.[1],
        parts,
      },
    },
  }))
}
