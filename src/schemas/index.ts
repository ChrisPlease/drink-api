import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql'
import { drinkType, drinkInput } from './drinks.schema'
import { entryInput, entryType } from './entries.schema'
import { ingredientType } from './ingredients.schema'
import { logType, logVolumeHistoryType } from './logs.schema'
import { userInput, userType } from './users.schema'

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
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
        search: { type: GraphQLString },
      },
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
    // drinkEntries: {
    //   type: entryType,
    //   args: {
    //     drinkId: { type: GraphQLID },
    //     unique: { type: GraphQLBoolean },
    //   },
    // },
    entry: {
      type: entryType,
      args: {
        id: { type: GraphQLID },
        unique: { type: GraphQLBoolean },
      },
    },
    entries: {
      type: new GraphQLList(entryType),
      args: {
        drinkId: { type: GraphQLID },
      },
    },
    logs: {
      type: new GraphQLList(logType),
      args: {
        unique: { type: GraphQLBoolean },
      },
    },
    logHistory: {
      type: new GraphQLList(logVolumeHistoryType),
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
    userCreate: {
      type: userType,
      args: {
        user: { type: userInput },
      },
    },
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
    },

    entryCreate: {
      type: entryType,
      args: {
        entry: { type: entryInput },
      },
    },
  },
})

export const schema = new GraphQLSchema({query: queryType, mutation: mutationType})
