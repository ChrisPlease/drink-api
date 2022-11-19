import {
  drinkResolver,
  drinksResolver,
  drinkCreateResolver,
  drinkEditResolver,
} from './drinks.resolver'
import {
  ingredientResolver,
  ingredientsResolver,
} from './ingredients.resolver'
import {
  drinkEntriesResolver,
  entriesResolver,
  entryCreateResolver,
  entryResolver,
} from './entries.resolver'
import {
  logsResolver,
  logVolumeHistoryResolver,
} from './logs.resolver'
import {
  userResolver,
  usersResolver,
  userCreateResolver,
} from './users.resolver'

export const resolvers = {
  Query: {
    drink: drinkResolver,
    drinks: drinksResolver,
    ingredient: ingredientResolver,
    ingredients: ingredientsResolver,
    drinkEntries: drinkEntriesResolver,
    entries: entriesResolver,
    entry: entryResolver,
    currentUser: userResolver,
    user: userResolver,
    users: usersResolver,
  },
  Drink: {
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
    logs: logsResolver,
    logHistory: logVolumeHistoryResolver,
  },
  User: {
    drinks: drinksResolver,
    entries: entriesResolver,
  },
}
