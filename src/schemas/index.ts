import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
} from 'graphql'
import { Drink, Ingredient } from '../models'
import { paginationType } from './pagination'
import { drinkType, drinkInput } from './drinks'
import { ingredientType } from './ingredients'
import { DrinkModel } from '../models/Drink.model'
import { drinkResolver, drinksResolver } from '../resolvers/drinks.resolver'
import { ingredientResolver, ingredientsResolver } from '../resolvers/ingredients.resolver'

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    drink: {
      type: drinkType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: drinkResolver,
    },
    drinks: {
      type: paginationType(drinkType),
      args: {
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
        search: { type: GraphQLString },
      },
      resolve: drinksResolver,
    },
    ingredient: {
      type: ingredientType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: ingredientResolver,
    },
    ingredients: {
      type: paginationType(ingredientType),
      args: {
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
      },
      resolve: ingredientsResolver,
    },
  },
})


const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createDrink: {
      type: drinkType,
      args: {
        drink: { type: drinkInput },
      },
      async resolve(_, { drink: { ingredients: drinkIngredients, ...rest } }, ctx) {
        const userId = ctx.user.id
        let drink = await Drink.create({ ...rest, userId })
        if (drinkIngredients) {
          const ingredients = await Promise.all(
            drinkIngredients
              .map(
                async ({
                  parts,
                  drinkId,
                }: {
                  parts: number,
                  drinkId: string,
                }) => await Ingredient.findCreateFind({ where: { parts, drinkId } }),
              ),
          ).then((ing) => ing.map(([i]) => i))

          await drink.setIngredients(ingredients)

          drink = await Drink.findByPk(drink.id, {
            include: [{
              model: Ingredient,
              through: { attributes: [] },
              include: [{ model: Drink }],
            }],
          }) as DrinkModel

          await drink.save()
          return drink
        }
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
