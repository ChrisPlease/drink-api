import { PrismaClient, Drink, Prisma } from '@prisma/client'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import {
  DrinkCreateInput,
  DrinkEditInput,
  DrinkNutrition,
  DrinkNutritionInput,
  IngredientInput,
  MutationDrinkDeleteArgs,
  NumberFilter,
  QueryDrinksArgs,
} from '@/__generated__/graphql'
import {
  deconstructId,
  toCursorHash,
  getCursor,
  encodeCursor,
  fromCursorHash,
} from '@/utils/cursorHash'
import { snakeToCamel } from '@/utils/string-manipulation'
import { queryIngredientNutrition } from '@/utils/queries'
import { NutritionResult } from '@/types/models'

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
type DrinkPayload = Prisma.DrinkGetPayload<{ include: { _count: { select: { ingredients: boolean } } } }>

export function Drinks(prismaDrink: PrismaClient['drink']) {
  return Object.assign(prismaDrink, {
    async findUniqueById(drinkId: string) {
      const [,id] = deconstructId(drinkId)
      const { _count: count, ...res } = <DrinkPayload>await prismaDrink.findUnique({
        where: { id, deleted: { not: null } },
        include: {
          _count: {
            select: { ingredients: true },
          },
        },
      }) || {}

      return res ? {
        ...res,
        id: toCursorHash(`${
          count?.ingredients > 0 ? 'MixedDrink' : 'BaseDrink'
        }:${id}`),
      } : null
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
        id,
        isMixedDrink,
        search,
        nutrition,
        isUserDrink,
      } = filterInput || {}
      const { coefficient, caffeine, sugar} = nutrition || {}

      function rangeFilter(filters: NumberFilter[]): Prisma.FloatNullableFilter<'Nutrition'> {
        return filters.reduce((acc, { comparison, value }) => ({ ...acc, [comparison]: value }), {})
      }

      const filter = {
        ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
        nutrition: {
          ...(coefficient ? { coefficient: rangeFilter(coefficient) } : {}),
          ...(caffeine ? { caffeine: rangeFilter(caffeine) } : {}),
          ...(sugar ? { sugar: rangeFilter(sugar) } : {}),
        },
        ...(id?.in ? { id: { in: id.in.map(drinkId => deconstructId(drinkId)?.[1]) } } : {}),
        ...(
          (isMixedDrink !== undefined)
            ? isMixedDrink ? { ingredients: { some: {} } } : { ingredients: { none: {} } }
            : {}
          ),
      }

      const where: Prisma.DrinkWhereInput = {
        ...(
          (userId || isUserDrink)
            ? userId ? { userId } : { userId: reqUser }
            : {
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

      const { nutrition, ...rest } = data

      if (data.nutrition) {
        return await prismaDrink.create({
          data: {
            ...rest,
            nutrition: {
              create: {
                ...data.nutrition,
                imperialSize: Math.ceil(data.nutrition.metricSize / 29.57373),
              },
            },
          },
        })
        .then(({ id, ...rest }) => ({
          id: toCursorHash(`BaseDrink:${id}`),
          ...rest,
        }))

      }

      return null
    },

    async createWithIngredients({
      ingredients: drinkIngredients,
      nutrition,
      ...data
    }: Omit<DrinkCreateInput, 'nutrition'> & { userId: string; nutrition: DrinkNutritionInput },
    client: PrismaClient,
    ): Promise<Drink> {
      const ingredients = mapToInputIngredients(drinkIngredients || [])

      return await client.$transaction(async (tx) => {

        const { id } = await tx.drink.create({
          data: {
            ...data,
            nutrition: {
              create: {
                imperialSize: Math.ceil((nutrition?.metricSize || 1) / 29.57373),
                ...nutrition,
              },

            },
            ingredients: { create: ingredients },
          },
        })

        return await this.findWithIngredientNutrition(id, tx)
      })

    },

    async updateWithIngredients(
      {
        id: drinkId,
        userId,
        ingredients: newIngredients,
        nutrition,
        ...data
      }: DrinkEditInput & { userId: string },
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
            ...(nutrition ? {
              nutrition: { update: { ...nutrition } },
            } : {}),
            ingredients: { create: ingredients },
          },
        })

        return await this.findWithIngredientNutrition(id, tx)
      })

    },

    async updateWithNutrition({
      id: drinkId,
      nutrition,
      userId,
      ...data
    }: Omit<DrinkEditInput, 'ingredients'> & { userId: string }): Promise<Drink | null> {
      const [,id] = deconstructId(drinkId)

      return await prismaDrink.update({
        where: { id },
        data: {
          ...data,
          nutrition: { update: { ...nutrition } },
          userId,
        },
      })
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
          include: { nutrition: true },
        }),
      ])

      const {
        nutrition,
      } = <Prisma.DrinkGetPayload<{ include: { nutrition: true } }>>drink

      return entries?.map(({ volume, ...entry }) => {

        return {
          volume,
          ...nutrition,
          ...entry,
          id: toCursorHash(`Entry:${entry.id}`),
        }
      }) || []
    },

    async deleteDrink(
      { id: drinkId, userId }: MutationDrinkDeleteArgs & { userId: string },
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

    async queryNutritionFromIngredients(
      drinkId: string,
      client: TransactionClient,
    ): Promise<NutritionResult> {
      const [rawQuery] = await queryIngredientNutrition(client as PrismaClient, drinkId)

      return Object.entries(rawQuery).reduce((acc, [key, val]) => ({
        [snakeToCamel(key)]: +(val as string),
        ...acc,
      }), {} as NutritionResult)
    },

    async findWithIngredientNutrition(
      id: string,
      client: TransactionClient,
    ): Promise<Drink> {
      const nutrition = await this.queryNutritionFromIngredients(id, client)

      return await client.drink.update({ where: { id }, data: { nutrition: { update: { ...nutrition } } } })
        .then(({ ...drink }) => ({
          ...drink,
          id: toCursorHash(`MixedDrink:${drink?.id}`),
        }))
    },
  })
}

function mapToInputIngredients(
  ingredients?: IngredientInput[],
): Prisma.DrinkIngredientsCreateWithoutDrinkInput[] {
  return (ingredients || []).map(({ drinkId, parts, volume }) => ({
    ingredient: {
      create: {
        drinkId: deconstructId(drinkId || '')?.[1],
        ...(parts ? { parts } : {}),
        ...(volume ? { volume } : {}),
      },
    },
  }))
}
