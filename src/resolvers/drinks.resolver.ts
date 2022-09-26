import { GraphQLFieldResolver } from 'graphql'
import { Drink, Ingredient } from '../models'
import { Op } from 'sequelize'
import { DrinkModel } from '../models/Drink.model'
import { AppContext } from '../types/context'

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

export const drinksResolver: GraphQLFieldResolver<any, any, any, any> = async (
  parent,
  { search },
  { req },
) => {
  const { rows: drinks } = await Drink.findAndCountAll({
    where: {
      ...(search ? { name: { [Op.iLike]: `%${search}%` as string }} : {}),
      [Op.or]: [
        { userId: { [Op.is]: null } },
        { userId: req.user.id },
      ],
    },
    distinct: true,
    order: [['id', 'asc']],
    include: [{ model: Ingredient, as: 'ingredients' }],
  })

  return drinks
}

interface DrinkInput {
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
    loaders: { drinksLoader },
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
    drinksLoader.prime(drink.id, drink)

    return drink
  }
}
