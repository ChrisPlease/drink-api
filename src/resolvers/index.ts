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
  entriesResolver,
} from './entries.resolver'
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
  },
  Ingredient: {
    drink: drinkResolver,
  },
  Entry: {
    drink: drinkResolver,
  },
  User: {
    drinks: drinksResolver,
  },
}
