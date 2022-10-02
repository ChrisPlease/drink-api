import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'
import { Drink } from '../models'
import { drinkType, drinkInput } from './drinks.schema'
import { entryInput, entryType } from './entries.schema'
import { ingredientType } from './ingredients.schema'
import { userType } from './users.schema'

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    drink: {
      type: drinkType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)},
      },
    },
    drinks: {
      type: new GraphQLList(drinkType),
      args: {
        first: {type: GraphQLInt},
        after: {type: GraphQLString},
        search: {type: GraphQLString},
      },
    },
    ingredient: {
      type: ingredientType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)},
      },
    },
    ingredients: {
      type: new GraphQLList(ingredientType),
    },
    entry: {
      type: entryType,
      args: {
        id: { type: GraphQLID },
      },
    },
    entries: {
      type: new GraphQLList(entryType),
    },
    currentUser: {
      type: userType,
    },
    user: {
      type: userType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)},
      },
    },
    users: {
      type: new GraphQLList(userType),
    },
  },
})

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    drinkCreate: {
      type: drinkType,
      args: {
        drink: {type: drinkInput},
      },
    },
    drinkEdit: {
      type: drinkType,
      args: {
        drink: {type: drinkInput},
      },
    },
    deleteDrink: {
      type: drinkType,
      args: {
        drinkId: {type: GraphQLInt},
      },
      async resolve(_, {drinkId}, ctx) {
        const drink = await Drink.findByPk(drinkId)

        if (drink && +ctx.user.id === drink.userId) {
          await drink.destroy()
        }

        console.log(drink)
      },
    },

    entryCreate: {
      type: entryType,
      args: {
        entry: {type: entryInput},
      },
    },
  },
})

export const schema = new GraphQLSchema({query: queryType, mutation: mutationType})
