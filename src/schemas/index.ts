import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql'
// import { Drink, Ingredient } from '../models'
import { drinkType/* , drinkInput */ } from './drinks'
import { ingredientType } from './ingredients'
// import { DrinkModel } from '../models/Drink.model'

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

/*
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
 */
export const schema = new GraphQLSchema({ query: queryType/* , mutation: mutationType */ })
