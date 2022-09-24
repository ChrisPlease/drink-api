import { GraphQLFieldResolver } from 'graphql'
import { Drink, Ingredient } from '../models'
import { Op } from 'sequelize'

export const drinkResolver: GraphQLFieldResolver<any, any, { id: number }> = async (
  parent,
  { id },
) => {
  console.log('resolving the single drink', parent)
  const drink = await Drink.findByPk(parent?.drinkId || id)

  return drink
}

export const drinksResolver: GraphQLFieldResolver<any, any, any, any> = async (
  parent,
  { search },
  { req },
) => {
  console.log('resolving all drinks')
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
  })

  return drinks
}
