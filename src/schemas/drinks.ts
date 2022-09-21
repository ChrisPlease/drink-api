import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLInt,
} from 'graphql'
import { Op } from 'sequelize'
import { Drink } from '../models'
import { ingredientType, ingredientInput } from './ingredients'

export const drinkType: GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'Drink',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    icon: { type: new GraphQLNonNull(GraphQLString) },
    coefficient: { type: GraphQLFloat },
    caffeine: { type: GraphQLFloat },
    sugar: { type: GraphQLFloat },
    ingredients: {
      type: new GraphQLList(ingredientType),
      resolve: async ({ ingredients: drinkIngredients }) => {
        if (drinkIngredients.length) {
          const drinkIds = drinkIngredients.map(({ drinkId }: { drinkId: unknown }) => drinkId)
          const ingredients = await Drink.findAll({ where: { id: { [Op.in]: drinkIds } } })
            .then(drinks => drinks.map(drink => drink.toJSON()))
            .then(drinks => drinks.map(drink => ({ parts: 4, drink })))

          return ingredients
        }
      },
    },
  }),
})

export const drinkInput = new GraphQLInputObjectType({
  name: 'DrinkInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    icon: { type: new GraphQLNonNull(GraphQLString) },
    caffeine: { type: GraphQLInt },
    coefficient: { type: GraphQLFloat },
    sugar: { type: GraphQLInt },
    ingredients: { type: new GraphQLList(ingredientInput) },
  },
})
