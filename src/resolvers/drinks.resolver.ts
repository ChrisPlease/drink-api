import { GraphQLFieldResolver } from 'graphql'
// import chalk from 'chalk'
import { dataSource } from '../database/data-source'
import { AppContext } from '../types/context'
import { Drink } from '../database/entities/Drink.entity'
import { Ingredient } from '../database/entities/Ingredient.entity'
import { User } from '../database/entities/User.entity'
import { IsNull } from 'typeorm'

const drinkRepository = dataSource.getRepository(Drink)

export const drinkResolver: GraphQLFieldResolver<Ingredient | undefined, AppContext, { id: string }> = async (
  parent,
  { id },
  /* { loaders: { drinksLoader } }, */
  { req: { auth } },
) => {
  console.log('getting it from entry', parent)
  const drink = await drinkRepository.findOne({
    where: {
      id: parent?.drinkId || id,
    },
    relations: ['ingredients'],
  })

  return drink
}

export const drinksResolver: GraphQLFieldResolver<
  User | undefined,
  AppContext,
  { search: string; first: number; after: string },
  any
> = async (
  parent,
  params,
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
    drink: { ingredients: drinkIngredients, servingSize, ...rest },
  },
  {
    req: { auth },
  },
) => {
  console.log('--------------------------------')
  console.log('begin drink transaction')
  console.log('--------------------------------')
  const userId = <string>auth?.sub
  const drink = new Drink()

  drink.userId = userId

  if (drinkIngredients) {

    drink.ingredients = await drink.addIngredients(drinkIngredients)

    const [{ caffeine, sugar, coefficient }] = await dataSource
      .createQueryBuilder(Ingredient, 'i')
      .select(
        'ROUND(SUM((i.parts::float/t.total)*d.coefficient)::numeric, 2)',
        'coefficient',
      )
      .addSelect(
        'ROUND(SUM((i.parts::float/t.total)*d.caffeine)::numeric, 2)',
        'caffeine',
      )
      .addSelect(
        'ROUND(SUM((i.parts::float/t.total)*d.sugar)::numeric, 2)',
        'sugar',
      )
      .innerJoin(Drink, 'd', 'd.id = i.drink_id')
      .innerJoin(qb => {
        return qb.select('SUM(i.parts)', 'total')
          .from(Ingredient, 'i')
          .leftJoin(Drink, 'd', 'd.id = i.drink_id')
          .whereInIds(drink.ingredients?.map(({ id }) => id))
      }, 't', 'true')
      .whereInIds(drink.ingredients?.map(({ id }) => id))
      .execute()

    drink.coefficient = coefficient
    drink.caffeine = caffeine
    drink.sugar = sugar

    return await drinkRepository.save({ ...rest, ...drink })
  } else {
    if (!servingSize) {
      throw new Error('Drink serving size required')
    }

    const { caffeine, sugar } = rest

    drink.sugar = Math.round(((sugar || 0)  / servingSize) * 1000) / 1000
    drink.caffeine = Math.round(((caffeine || 0) / servingSize) * 1000) / 100
    return drinkRepository.save({ ...rest, ...drink })
  }

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
