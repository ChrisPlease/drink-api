import { Drink } from '/opt/nodejs/node_modules/.prisma/client'
import { deconstructId } from '@waterlog/utils'
import { Drinks } from '@/models/Drink.model'
import { Entries } from '@/models/Entry.model'
import { DrinkNutritionInput, MutationResolvers } from '@/__generated__/graphql'

export const mutationResolvers: MutationResolvers = {
  async entryCreate(_, args, { prisma, user }) {

    return await Entries(prisma.entry)
      .createEntry({ ...args, userId: <string>user }, prisma.drink)
  },

  async entryDelete(_, args, { prisma, user }) {
    const res = Entries(prisma.entry)
      .deleteAndReturn({ ...args, userId: <string>user }, prisma)
    return res
  },

  async drinkCreate(_, { drinkInput }, { prisma, user }) {
    let res: Drink | null
    const drink = Drinks(prisma.drink)
    const userId = <string>user

    const {
      ingredients,
      nutrition,
      ...rest
    } = drinkInput

    if (ingredients && ingredients.length) {
      res = await drink.createWithIngredients(
        { userId, nutrition: nutrition as DrinkNutritionInput, ingredients, ...rest },
        prisma,
      )
    } else {
      res = await drink.createWithNutrition({ userId, nutrition, ...rest }) || null
    }

    return res
  },

  async drinkEdit(
    _,
    {
      drinkInput: {
        nutrition,
        serving,
        ingredients,
        ...drinkInput
      },
    }, { prisma, user }) {
    let res: Drink | null
    const drink = Drinks(prisma.drink)
    const userId = <string>user

    if (!drinkInput.id) throw new Error('Drink ID required')
    const [type,id] = deconstructId(drinkInput.id)

    try {
      await prisma.drink.findUniqueOrThrow({ where: { id_userId: { id, userId } } })
    } catch (err: any) {
      console.error(err)
      throw new Error('Drink not found')
    }

    if (type === 'MixedDrink') {
      if (ingredients) {
        res = await Drinks(prisma.drink).updateWithIngredients(
          { userId, nutrition, ingredients, ...drinkInput },
          prisma,
        )
      } else {
        const { id: drinkId, ...rest } = drinkInput
        res = await drink.update({
          where: { id_userId: { id, userId } },
          data: { userId, ...rest },
        })
      }
    } else if (type === 'BaseDrink') {
      if (ingredients) throw new Error('Cannot add ingredients to a Base Drink')

      if (Object.values(nutrition || {}).some(item => item) && !serving?.servingSize) {
        throw new Error('Serving size is required when editing nutritional values')
      }

      res = await drink.updateWithNutrition({
        userId,
        nutrition,
        ...drinkInput,
      })
    } else {
      throw new Error('Cannot recognize Drink Type')
    }

    res = { ...res, id: drinkInput.id } as Drink

    return res
  },

  async drinkDelete(_, { id: drinkId }, { prisma, user }) {
    const userId = <string>user
    const res = await Drinks(prisma.drink).deleteDrink({ id: drinkId, userId })

    return res
  },

  async userCreate(_, { id: userId }, { prisma }) {
    try {
      return await prisma.user.create({ data: { id: userId } })
    } catch (err: any) {
      console.error(err)
      throw new Error('User already exists')
    }
  },
}
