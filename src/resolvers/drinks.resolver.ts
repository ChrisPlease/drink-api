import { GraphQLFieldResolver } from 'graphql'
// import chalk from 'chalk'
import { dataSource } from '../database/data-source'
import { AppContext } from '../types/context'
import { Drink } from '../database/entities/Drink.entity'
import { Ingredient } from '../database/entities/Ingredient.entity'
import { User } from '../database/entities/User.entity'
import { IsNull } from 'typeorm'

const drinkRepository = dataSource.getRepository(Drink)
const ingredientRepository = dataSource.getRepository(Ingredient)

export const drinkResolver: GraphQLFieldResolver<Ingredient | undefined, AppContext, { id: string }> = async (
  parent,
  { id },
  { loaders: { drinksLoader } },
) => {
  return await drinkRepository.findOne({
    where: {
      id: parent?.drinkId || id,
    },
    relations: ['ingredients'],
  })
}

export const drinksResolver: GraphQLFieldResolver<
  User | undefined,
  AppContext,
  { search: string; first: number; after: string },
  any
> = async (
  parent,
  { search },
  {
    req: {
      auth,
    },
  },

) => {
  const isUserDrinks = parent instanceof User
  const [drinks, count] = await dataSource.getRepository(Drink).findAndCount({
    where: [
      { userId: isUserDrinks ? parent.id : auth?.sub },
      ...(!isUserDrinks ? [{ userId: IsNull() }] : []),
    ],
  })

  console.log('COUNT:', count)

  return drinks
}

interface DrinkInput {
  id: string;
  name: string;
  icon: string;
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
    drink: { ingredients: drinkIngredients, ...rest },
  },
  {
    req: { auth },
  },
) => {
  const userId = <string>auth?.sub

  const drink = drinkRepository.create({
    ...rest,
    user: { id: userId },
  })

  if (drinkIngredients) {
    drink.ingredients = await drink.addIngredients(drinkIngredients)
  }

  await drink.save()

  return drink
}

export const drinkEditResolver: GraphQLFieldResolver<any, AppContext, { drink: DrinkInput }, any> = async (
  parent,
  { drink: drinkInput },
  {
    req: { auth },
    // loaders: { drinksLoader },
  },
) => {
  const { id, ingredients, ...rest } = drinkInput
  const userId = auth?.sub

  if (!await drinkRepository.exist({ where: { userId, id } })) {
    throw new Error('Drink not found.')
  }

  const drink: Drink = await drinkRepository
    .save({
      id,
      ...(ingredients ? { ingredients } : {}),
      ...rest,
    }, { reload: true })

  console.log('foo', drink)

  return drink
}
