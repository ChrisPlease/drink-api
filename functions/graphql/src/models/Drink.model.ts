import { PrismaClient, Drink, Prisma } from '@prisma/client'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import {
  DrinkCreateInput,
  DrinkEditInput,
  DrinkNutritionInput,
  DrinkSort,
  IngredientInput,
  MutationDrinkDeleteArgs,
  QueryDrinksArgs,
  Sort,
} from '@/__generated__/graphql'
import {
  deconstructId,
  toCursorHash,
  getCursor,
  encodeCursor,
  fromCursorHash,
} from '@/utils/cursorHash'
import { snakeToCamel } from '@/utils/string-manipulation'
import { rangeFilter, stringFilter } from '@/utils/filters'
import { queryIngredientNutrition } from '@/utils/queries'
import { DrinkWithIngredientCountPayload } from '@/types/drinks'
import { NutritionResult, ReturnedDrinkResult } from '@/types/models'

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export function Drinks(prismaDrink: PrismaClient['drink']) {
  return Object.assign(prismaDrink, {

    async findUniqueById(drinkId: string) {
      const [,id] = deconstructId(drinkId)
      const response = <DrinkWithIngredientCountPayload>await prismaDrink.findUnique({
        where: { id },
        include: {
          _count: {
            select: { ingredients: true },
          },
        },
      })

      if (response) {
        const { _count: count, ...rest } = response
        return {
          ...rest,
          id: toCursorHash(`${
            count?.ingredients > 0 ? 'MixedDrink' : 'BaseDrink'
          }:${id}`),
        }
      }

      return null
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
        nutrition: nutritionFilter,
        isUserDrink,
      } = filterInput || {}

      const nutrition = Object.entries(nutritionFilter || {}).reduce((acc, [key, val]) => ({
        ...(val ? {[key]: rangeFilter(val)} : {}),
        ...acc,
      }), {})

      const filter: Prisma.DrinkWhereInput = {
        ...stringFilter('name', search),
        nutrition,
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
      ] = <[keyof DrinkSort, Prisma.SortOrder]>Object.entries(sort || {
        name: 'asc',
      })[0]

      const mappedSortKey =
        sortKey === 'entryCount' ? 'entries' : sortKey

      const orderBy = <Prisma.DrinkOrderByWithRelationInput>(
        ['name', 'createdAt'].includes(sortKey)
          ? { [sortKey]: sortValue.toLowerCase() }
          : ([
            {
              [mappedSortKey]: (mappedSortKey === 'entries'
                ? { _count: sortValue.toLowerCase() }
                : sortValue),
            }, {
              name: Sort.Asc.toLowerCase(),
            },
          ])
      )

      const cursorKey = <keyof Prisma.DrinkWhereUniqueInput>(
        ['name', 'createdAt', 'entries'].includes(mappedSortKey)
          ? mappedSortKey === 'name' ? 'id' : 'createdAt'
          : `id_${mappedSortKey}`
      )

      const { include, orderBy: orderByArg, ...baseArgs }: Prisma.DrinkFindManyArgs = {
        where,
        include: {
          _count: {
            select: { ingredients: true },
          },
        },
        orderBy,
      }

      return await findManyCursorConnection<ReturnedDrinkResult, Prisma.DrinkWhereUniqueInput>(
        (args) => prismaDrink
          .findMany({ ...args, include, orderBy: orderByArg, ...baseArgs })
          .then(drinks => drinks.map(({ _count, id, servingSize, servingUnit, metricSize, ...drink }) => ({
            id: toCursorHash(`${
              _count.ingredients > 0 ? 'MixedDrink' : 'BaseDrink'
            }:${id}`),
            serving: { metricSize, servingUnit, servingSize },
            ...drink,
          }))),
        () => prismaDrink.count(baseArgs as Prisma.DrinkCountArgs),
        { first, last, after, before },
        {
          getCursor: (
            record,
          ) => getCursor<ReturnedDrinkResult, Prisma.DrinkWhereUniqueInput>(record, cursorKey),
          encodeCursor: (cursor) => toCursorHash(JSON.stringify(encodeCursor(cursor, ['id']))),
          decodeCursor: (cursorString) => JSON.parse(fromCursorHash(cursorString)),
        },
      )
    },

    async createWithNutrition(
      data: (Omit<DrinkCreateInput, 'ingredients'> & { userId: string }),
    ) {

      const { nutrition, serving, ...rest } = data

      /* istanbul ignore if -- @preserve */
      if (data.nutrition) {
        return await prismaDrink.create({
          data: {
            ...rest,
            ...serving,
            nutrition: {
              create: {
                ...data.nutrition,
              },
            },
          },
        })
        .then(({ id, ...rest }) => ({
          id: toCursorHash(`BaseDrink:${id}`),
          ...rest,
        }))

      }
    },

    async createWithIngredients({
      ingredients: drinkIngredients,
      serving,
      nutrition,
      ...data
    }: Omit<DrinkCreateInput, 'nutrition'> & { userId: string; nutrition: DrinkNutritionInput },
    client: PrismaClient,
    ): Promise<Drink> {
      const ingredients = mapCreateToInputIngredients(drinkIngredients || [])

      return await client.$transaction(async (tx) => {
        const { id } = await tx.drink.create({
          data: {
            ...data,
            ...serving,
            nutrition: {
              create: {
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

        const ingredients = mapCreateToInputIngredients(newIngredients)

        await tx.drink.update({
          where: {
            id_userId: { id, userId },
          },
          data: {
            ...data,
            ...mapUpdateToInputNutrition(nutrition),
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
          ...mapUpdateToInputNutrition(nutrition),
          userId,
        },
      })
        .then(({ id, ...rest }) => ({
          id: toCursorHash(`BaseDrink:${id}`),
          ...rest,
        }))
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

      const ingredients = await prismaDrink.findUnique({ where: { id } })
        .ingredients({ include: { ingredient: true } })
        .then(ingredients => ingredients?.map(({ ingredient }) => ingredient))

      return ingredients || []
    },

    async findDrinkUser(userId: string) {
      const [,id] = deconstructId(userId)

      const user = await prismaDrink.findUnique({ where: { id } }).user()

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

      return await client.drink
        .update({
          where: { id },
          data: mapUpdateToInputNutrition(nutrition),
        })
        .then(({ ...drink }) => ({
          ...drink,
          id: toCursorHash(`MixedDrink:${drink?.id}`),
        }))
    },
  })
}

function mapCreateToInputIngredients(
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

function mapUpdateToInputNutrition(
  nutrition: NutritionResult | DrinkNutritionInput | undefined | null,
): { nutrition?: Prisma.NutritionUpdateOneWithoutDrinkNestedInput } {
  return nutrition ? {
    nutrition: {
      update: nutrition,
    },
  } : {}
}
