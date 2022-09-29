import { GraphQLFieldResolver, GraphQLObjectType } from 'graphql'
import { Drink, Ingredient } from '../models'
import { Op } from 'sequelize'
import { DrinkModel } from '../models/Drink.model'
import { AppContext } from '../types/context'
import { UserModel } from '../models/User.model'

export const drinkResolver: GraphQLFieldResolver<any, AppContext, { id: number }> = async (
  parent,
  { id },
  { loaders },
) => {
  let drink: DrinkModel = {} as DrinkModel
  try {
    drink = await loaders.drinksLoader.load(parent?.drinkId || id) as DrinkModel
  } catch (err) {
    drink = await Drink.findByPk(parent?.id || id, {
      include: [{
        model: Ingredient, as: 'ingredients',
      }],
    }) as DrinkModel
  }
  return drink
}

export const drinksResolver: GraphQLFieldResolver<
  InstanceType<typeof GraphQLObjectType> | UserModel | undefined,
  AppContext,
  { search: string; first: number; after: string },
  any
> = async (
  parent,
  { search },
  { req },
) => {
  console.log('here')
  const isUserDrinks = parent instanceof UserModel

  const { rows: drinks } = await Drink.findAndCountAll({
    where: {
      ...(search ? { name: { [Op.iLike]: `%${search}%` as string }} : {}),
      [Op.or]: [
        { userId: isUserDrinks ? parent.id : req.user?.id },
        ...(!isUserDrinks ? [{ userId: { [Op.is]: null } }] : []),
      ],
    },
    distinct: true,
    order: [['id', 'asc']],
    include: [{ model: Ingredient, as: 'ingredients' }],
  })

  return drinks
}

interface DrinkInput {
  id?: number;
  name: string;
  icon: string;
  caffeine?: number;
  sugar?: number;
  coefficient?: number;
  ingredients?: {
    parts: number,
    drinkId: number,
  }[];
}

export const drinkCreateResolver: GraphQLFieldResolver<any, any, { drink: DrinkInput }, any> = async (
  parent,
  {
    drink: { ingredients: drinkIngredients, ...rest },
  },
  {
    req,
  },
) => {
  const userId = req.user.id
  let drink = await Drink.create({ ...rest, userId })
  if (drinkIngredients) {
    const ingredients = await Promise.all(
      drinkIngredients
        .map(
          async ({
            parts,
            drinkId,
          }: {
            parts: number,
            drinkId: number,
          }) => await Ingredient.findCreateFind({ where: { parts, drinkId } }),
        ),
    ).then((ing) => ing.map(([i]) => i))

    await drink.setIngredients(ingredients)

    drink = await Drink.findByPk(drink.id, {
      include: [{ model: Ingredient, as: 'ingredients' }],
    }) as DrinkModel

    await drink.save()
  }
  return drink
}

export const drinkEditResolver: GraphQLFieldResolver<any, AppContext, { drink: DrinkInput }, any> = async (
  parent,
  { drink: drinkInput },
  {
    req: { user },
    loaders: { drinksLoader },
  },
) => {
  if (!drinkInput.id) {
    throw new Error('ID is required when editing a drink')
  }

  let drink: DrinkModel
  const userId = user?.id
  const { id, ingredients, ...rest } = drinkInput

  try {
    drink = await drinksLoader.load(drinkInput.id) as DrinkModel
  } catch {
    drink = await Drink.findByPk(drinkInput.id, {
      attributes: { include: ['userId'] },
      include: [{ model: Ingredient, as: 'ingredients' }],
    }) as DrinkModel
  }

  if (drink.totalParts > 1 && !ingredients) {
    throw new Error('This is a mixed drink, must include ingredients')
  }

  const drinkUser = await drink.getUser()
  if (userId !== drinkUser.id) {
    throw new Error('You do not have the permissions to edit this drink')
  }

  await drink.update(rest, { where: { id } })

  if (ingredients) {
    console.log('has ingredients')
  }

  return drink

}
