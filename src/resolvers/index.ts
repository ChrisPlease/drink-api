import {
  drinkResolver,
  drinksResolver,
  drinkCreateResolver,
  drinkEditResolver,
} from './drinks.resolver'
import {ingredientResolver,
  ingredientsResolver} from './ingredients.resolver'
import {
  entriesResolver,
  entryCreateResolver,
  entryResolver,
} from './entries.resolver'
import {
  logsResolver,
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
  },
  User: {
    drinks: drinksResolver,
    entries: entriesResolver,
  },
}
