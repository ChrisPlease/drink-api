import { GraphQLFieldResolver } from 'graphql'
import { Drink, Ingredient } from '../models'
import { Op } from 'sequelize'

export const ingredientResolver: GraphQLFieldResolver<any, any> = async (
  _,
  { id },
) => {
  const ingredient = await Ingredient.findByPk(id, {
    include: [{
      model: Drink,
      as: 'drink',
    }],
  })

  return ingredient
}

export const ingredientsResolver: GraphQLFieldResolver<any, any> = async (
  _,
  {
    first,
    after,
  },
) => {
  console.log('resolving ingredients')
  const { rows: ingredients, count } = await Ingredient.findAndCountAll({
    where: {
      ...(after ? { id: { [Op.gt]: +after } } : {}),
    },
    distinct: true,
    limit: first,
    order: [['id', 'ASC']],
    include: [{ model: Drink, as: 'drink' }],
  }).then(({ rows, count }) => ({ rows: rows.map(i => ({ node: i.toJSON(), cursor: i.id })), count }))

  const lastCursor = ingredients[ingredients.length - 1]?.cursor

  return {
    edges: ingredients,
    pageInfo: {
      records: count,
      lastCursor,
    },
  }
}
