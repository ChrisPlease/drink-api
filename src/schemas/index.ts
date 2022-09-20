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
import { Op } from 'sequelize'
import { DrinkModel } from '../models/Drink.model'
import { drinkResolver } from '../resolvers/drinks.resolver'

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
      type: paginationType('Drinks', drinkType),
      args: {
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
        search: { type: GraphQLString },
      },
      resolve: async (_, { first, after, search }, ctx) => {
        const { rows: drinks, count } = await Drink.findAndCountAll({
          where: {
            ...(search ? { name: { [Op.iLike]: `%${search}%` as string }} : {}),
            ...(after ? { id: { [Op.gt]: +after } } : {}),
            [Op.or]: [
              { userId: { [Op.is]: null } },
              { userId: ctx.user.id },
            ],
          },
          distinct: true,
          limit: first,
          order: [['id', 'asc']],
          include: [{
            model: Ingredient,
            as: 'ingredients',
            through: {
              attributes: [],
            },
            include: [{
              model: Drink,
            }],
          }],
        }).then(({ rows, count }) => ({ rows: rows.map(d => ({ node: d.toJSON(), cursor: d.id })), count }))

        const lastCursor = drinks[drinks.length - 1]?.cursor

        return {
          edges: drinks,
          pageInfo: {
            records: count,
            lastCursor,
          },
        }
      },
    },
    ingredient: {
      type: ingredientType,
      args: {
        id: { type: GraphQLID },
      },
      async resolve(_, { id }) {
        const ingredient = await Ingredient.findByPk(id, {
          include: [{
            model: Drink,
            as: 'drink',
          }],
        })

        return ingredient
      },
    },
    ingredients: {
      type: paginationType('Ingredients', ingredientType),
      // type: new GraphQLList(ingredientType),
      args: {
        first: { type: GraphQLInt },
        after: { type: GraphQLString },
      },
      async resolve(_, { first, after }) {
        const { rows: ingredients, count } = await Ingredient.findAndCountAll({
          where: {
            ...(after ? { id: { [Op.gt]: +after } } : {}),
          },
          distinct: true,
          limit: first,
          order: [['id', 'ASC']],
          include: [{ model: Drink, as: 'drink' }],
        }).then(({ rows, count }) => ({ rows: rows.map(i => ({ node: i.toJSON(), cursor: i.id })), count }))

        const lastCursor = ingredients[ingredients.length - 1]?.cursor

        return {
          edges: ingredients,
          pageInfo: {
            records: count,
            lastCursor,
          },
        }
      },
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
