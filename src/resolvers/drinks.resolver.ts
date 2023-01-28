import { GraphQLFieldResolver } from 'graphql'
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
  { loaders: { drinksLoader } },
) => {
  console.log('getting a single drink', parent?.drinkId || id)
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
  console.log(auth?.sub)
  const isUserDrinks = parent instanceof User
  const [drinks, count] = await dataSource.getRepository(Drink).findAndCount({
    where: [
      { userId: isUserDrinks ? parent.id : auth?.sub },
      ...(!isUserDrinks ? [{ userId: IsNull() }] : []),
    ],
  })

  console.log(drinks, count)

  // console.log(foo)

  // const { rows: drinks } = await Drink.findAndCountAll({
  //   where: {
  //     ...(search ? { name: { [Op.iLike]: `%${search}%` as string }} : {}),
  //     [Op.or]: [
  //       { userId: isUserDrinks ? parent.id : auth?.sub },
  //       ...(!isUserDrinks ? [{ userId: { [Op.is]: null } }] : []),
  //     ],
  //   },
  //   distinct: true,
  //   order: [['id', 'asc']],
  //   include: [{ model: Ingredient, as: 'ingredients' }],
  // })

  return drinks
}

interface DrinkInput {
  id?: string;
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
  const drinkRepository = dataSource.getRepository(Drink)

  const drink = drinkRepository.create({
    ...rest,
    user: { id: userId },
  })

  if (drinkIngredients) {
    const ingredientRepository = dataSource.getRepository(Ingredient)

    const ingredients = await Promise.all(drinkIngredients.map(async (ing) => {
      const ingredient = await ingredientRepository.exist({ where: { ...ing } })
      ? <Ingredient>await ingredientRepository.findOne({ where: { ...ing } })
      : ingredientRepository.create(ing)

      return await ingredientRepository.save(ingredient)
    }))

    drink.ingredients = ingredients
  }

  return await drink.save()
}

export const drinkEditResolver: GraphQLFieldResolver<any, AppContext, { drink: DrinkInput }, any> = async (
  parent,
  { drink: drinkInput },
  {
    req: { auth },
    // loaders: { drinksLoader },
  },
) => {
  // if (!drinkInput.id) {
  //   throw new Error('ID is required when editing a drink')
  // }

  // let drink: DrinkModel
  // const userId = auth?.sub
  // const { id, ingredients: drinkIngredients, ...rest } = drinkInput

  // try {
  //   drink = await drinksLoader.load(drinkInput.id) as DrinkModel
  // } catch {
  //   drink = await Drink.findByPk(drinkInput.id, {
  //     attributes: { include: ['userId'] },
  //     include: [{ model: Ingredient, as: 'ingredients' }],
  //   }) as DrinkModel
  // }

  // if (drink.totalParts > 1 && !drinkIngredients) {
  //   throw new Error('This is a mixed drink, must include ingredients')
  // }

  // const drinkUser = await drink.getUser()
  // if (userId !== drinkUser.id) {
  //   throw new Error('You do not have the permissions to edit this drink')
  // }

  // await drink.update({ ...rest }, { where: { id } })

  // if (drinkIngredients) {
  //   console.log('has ingredients')
  // }

  // return drink
}
