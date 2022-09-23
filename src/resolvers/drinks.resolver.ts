import { GraphQLFieldResolver } from 'graphql'
import { Drink, Ingredient } from '../models'
import { Op } from 'sequelize'

export const drinkResolver: GraphQLFieldResolver<any, any, { id: number }> = async (
  prev,
  { id },
) => {
  return await Drink.findByPk(prev.drinkId || id, {
    include: [
      { model: Ingredient, as: 'ingredients', through: { attributes: [] } },
    ],
  })
}

export const drinksResolver: GraphQLFieldResolver<any, any, any, any> = async (
  _,
  {
    search,
    ...pagination
  },
  ctx,
) => {
  const { rows: drinks, count } = await Drink.findAndCountAll({
    where: {
      ...(search ? { name: { [Op.iLike]: `%${search}%` as string }} : {}),
      [Op.or]: [
        { userId: { [Op.is]: null } },
        { userId: ctx.user.id },
      ],
    },
    distinct: true,
    order: [['id', 'asc']],
    include: [
      { model: Ingredient, as: 'ingredients', through: { attributes: [] } },
    ],
  })

  return {
    nodes: drinks,
    pageInfo: {
      records: count,
      ...pagination,
    },
  }
}
