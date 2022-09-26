import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql'
import { Drink } from '../models'
import { drinkType, drinkInput } from './drinks'
import { ingredientType } from './ingredients'

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    drink: {
      type: drinkType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
    },
    drinks: {
      type: new GraphQLList(drinkType),
    },
    ingredient: {
      type: ingredientType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
    },
    ingredients: {
      type: new GraphQLList(ingredientType),
    },
  },
})

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    drinkCreate: {
      type: drinkType,
      args: {
        drink: { type: drinkInput },
      },
    },
    deleteDrink: {
      type: drinkType,
      args: {
        drinkId: { type: GraphQLInt },
      },
      async resolve(_, { drinkId }, ctx) {
        const drink = await Drink.findByPk(drinkId)

        if (drink && +ctx.user.id === drink.userId) {
          await drink.destroy()
        }

        console.log(drink)
      },
    },
  },
})

export const schema = new GraphQLSchema({ query: queryType, mutation: mutationType })
