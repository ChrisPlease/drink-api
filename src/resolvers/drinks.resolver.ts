import { GraphQLFieldResolver } from 'graphql'
import { Drink, Ingredient } from '../models'
import { Op } from 'sequelize'

export const drinkResolver: GraphQLFieldResolver<any, any, { id: number }> = async (
  prev,
  { id },
) => {
  console.log('resolving drink')
  return await Drink.findByPk(prev.drinkId || id, {
    include: [{
      model: Ingredient,
      as: 'ingredients',
      through: {
        attributes: [],
      },
      include: [{
        model: Drink,
      }],
    }],
  })
}

export const drinksResolver: GraphQLFieldResolver<any, any, any, any> = async (
  _,
  {
    first,
    after,
    search,
  },
  ctx,
) => {
  console.log('resolving DRINKS')
  const { rows: drinks, count } = await Drink.findAndCountAll({
    where: {
      ...(search ? { name: { [Op.iLike]: `%${search}%` as string }} : {}),
      ...(after ? { id: { [Op.gt]: +after } } : {}),
      [Op.or]: [
        { userId: { [Op.is]: null } },
        { userId: ctx.user.id },
      ],
    },
    distinct: true,
    limit: first,
    order: [['id', 'asc']],
    include: [{ model: Ingredient, as: 'ingredients', through: { attributes: [] } }],
  }).then(({ rows, count }) => ({ rows: rows.map(d => ({ node: d.toJSON(), cursor: d.id })), count }))

  const lastCursor = drinks[drinks.length - 1]?.cursor

  return {
    edges: drinks,
    pageInfo: {
      records: count,
      lastCursor,
    },
  }
}
