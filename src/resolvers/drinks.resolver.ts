import { GraphQLFieldResolver } from 'graphql'
import { AppContext } from '../types/context'
import { Ingredient, User } from '@prisma/client'
import { Drinks } from '../models/Drink.model'

export const drinkResolver: GraphQLFieldResolver<Ingredient | undefined, AppContext, { id: string }> = async (
  parent,
  { id },
  { prisma },
) => {
  return await prisma.drink.findUnique({
    where: {
      id: parent?.drinkId || id,
    },
  })
}

export const drinksResolver: GraphQLFieldResolver<
  unknown,
  AppContext,
  { search: string; first: number; after: string },
  any
> = async (
  parent,
  params,
  {
    prisma,
    req: {
      auth,
    },
  },

) => {
  const isUserDrinks = false
  const drinks = await prisma.drink.findMany({
    where: {
      ...(isUserDrinks ? {
        userId: auth?.sub,
      } : {
        OR: [
          { userId: auth?.sub },
          { userId: null },
        ],
      }),
    },
  })

  return drinks
}

interface DrinkInput {
  id: string;
  name: string;
  icon: string;
  servingSize?: number;
  caffeine?: number;
  sugar?: number;
  coefficient?: number;
  ingredients?: {
    parts: number,
    drinkId: string,
  }[];
}

export const drinkCreateResolver: GraphQLFieldResolver<any, AppContext, { drink: DrinkInput }, any> = async (
  parent,
  {
    drink: {
      ingredients: drinkIngredients,
      servingSize,
      caffeine,
      sugar,
      coefficient,
      ...rest
    },
  },
  {
    prisma,
    req: { auth },
  },
) => {
  const drink = Drinks(prisma.drink, prisma)
  const nutrition = {
    caffeine: (caffeine || 0) / (servingSize || 1),
    sugar: (sugar || 0) / (servingSize || 1),
    coefficient: coefficient || 0,
  }

  const userId = <string>auth?.sub

  if (!drinkIngredients) {
    return await drink.create({
      data: {
        userId,
        ...nutrition,
        ...rest,
      },
    })
  } else {
    return await drink.createWithIngredients({ userId, ...rest }, drinkIngredients)

  }


}

export const drinkEditResolver: GraphQLFieldResolver<any, AppContext, { drink: DrinkInput }, any> = async (
  parent,
  { drink: drinkInput },
  {
    req: { auth },
  },
) => {
  console.log(auth?.sub)
  console.log(drinkInput)
  throw new Error('not yet implemented')
}
