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
} from './entries.resolver'
import {
  logsResolver,
} from './logs.resolver'
import {
  userResolver,
  usersResolver,
} from './users.resolver'

export const resolvers = {
  Query: {
    drink: drinkResolver,
    drinks: drinksResolver,
    ingredient: ingredientResolver,
    ingredients: ingredientsResolver,
    entries: entriesResolver,
    currentUser: userResolver,
    user: userResolver,
    users: usersResolver,
  },
  Drink: {
    ingredients: ingredientsResolver,
  },
  Mutation: {
    drinkCreate: drinkCreateResolver,
    drinkEdit: drinkEditResolver,
    entryCreate: entryCreateResolver,
  },
  Ingredient: {
    drink: drinkResolver,
  },
  Entry: {
    drink: drinkResolver,
    logs: logsResolver,
  },
  User: {
    drinks: drinksResolver,
    entries: entriesResolver,
  },
}
