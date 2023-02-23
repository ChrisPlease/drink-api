import {
  drinkResolver,
  drinksResolver,
  drinkCreateResolver,
  drinkEditResolver,
} from './drinks.resolver'
import {
  ingredientsResolver,
} from './ingredients.resolver'
import {
  drinkEntriesResolver,
  entriesResolver,
  entryCreateResolver,
  entryResolver,
} from './entries.resolver'
import {
  userResolver,
  usersResolver,
  userCreateResolver,
} from './users.resolver'
import { DrinkResolvers, QueryResolvers, Resolvers } from '../__generated__/graphql'

export const resolvers: Resolvers = {
  Query: <QueryResolvers>{
    // drink: drinkResolver,
    // drinks: drinksResolver,
    // ingredients: ingredientsResolver,
    // drinkEntries: drinkEntriesResolver,
    // entries: entriesResolver,
    // entry: entryResolver,
    // currentUser: userResolver,
    // user: userResolver,
    // users: usersResolver,
  },
  Drink: <DrinkResolvers>{
    ingredients: ingredientsResolver,
    entries: entriesResolver,
  },
  Mutation: {
    drinkCreate: drinkCreateResolver,
    drinkEdit: drinkEditResolver,
    entryCreate: entryCreateResolver,
    userCreate: userCreateResolver,
  },
  Ingredient: {
    drink: drinkResolver,
  },
  Entry: {
    user: userResolver,
    drink: drinkResolver,
    // logs: logsResolver,
    // logHistory: logVolumeHistoryResolver,
  },
  User: {
    drinks: drinksResolver,
    entries: entriesResolver,
  },
}
