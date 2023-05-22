import { Drinks } from '@/models/Drink.model'
import { Entries } from '@/models/Entry.model'
import { MutationResolvers } from '@/__generated__/graphql'
import { deconstructId } from '@/utils/cursorHash'

export const mutationResolvers: MutationResolvers = {
  async entryCreate(_, args, { prisma, req: { auth } }) {
    return await Entries(prisma.entry)
      .createWithNutrition({
        ...args,
        userId: <string>auth?.sub,
      })
  },

  async entryDelete(_, args, { prisma, req: { auth } }) {
    return await Entries(prisma.entry)
      .deleteAndReturn({ ...args, userId: <string>auth?.sub }, prisma)
  },

  async drinkCreate(_, { drinkInput }, { prisma, req: { auth } }) {
    const drink = Drinks(prisma.drink)
    const userId = <string>auth?.sub

    const {
      ingredients,
      caffeine,
      servingSize,
      sugar,
      coefficient,
      ...rest
    } = drinkInput

    const nutrition = { caffeine, servingSize, sugar, coefficient }

    if (ingredients) {
      return await drink.createWithIngredients(
        { userId, servingSize, ingredients, ...rest },
        prisma,
      )
    }

    return await drink.createWithNutrition({ userId, ...nutrition, ...rest })
  },

  async drinkDelete(_, { drinkId }, { prisma, req: { auth } }) {
    return await Drinks(prisma.drink).deleteDrink({
      drinkId,
      userId: <string>auth?.sub,
    })
  },

  async drinkEdit(
    _,
    {
      drinkInput: {
        caffeine,
        sugar,
        servingSize,
        coefficient,
        ingredients,
        ...drinkInput
      },
    }, { prisma, req: { auth } }) {
    const hasNutrition = !!caffeine || !!sugar || !!coefficient
    const drink = Drinks(prisma.drink)
    const userId = <string>auth?.sub
    if (!drinkInput.id) throw new Error('Drink ID required')
    const [type,id] = deconstructId(drinkInput.id)

    await prisma.drink.findUniqueOrThrow({ where: { id, userId } })

    if (type === 'MixedDrink') {
      if (hasNutrition) throw new Error('Cannot add nutrition to a Mixed Drink')
      if (ingredients) {
        console.log('here')
        const res = await Drinks(prisma.drink).updateWithIngredients(
          { userId, ingredients, ...drinkInput },
          prisma,
        )
        console.log('res', res)
        return res
      } else {
        return await drink.update({
          where: { id, userId },
          data: { userId, ...drinkInput },
        })
      }
    } else if (type === 'BaseDrink') {
      if (ingredients) throw new Error('Cannot add ingredients to a Base Drink')
      const nutrition = { caffeine, sugar, coefficient }

      if (Object.values(nutrition).some(item => item) && !servingSize) {
        throw new Error('Serving size is required when editing nutritional values')
      }

      return await drink.updateWithNutrition({
        userId,
        servingSize,
        ...nutrition,
        ...drinkInput,
      })
    } else {
      throw new Error('Cannot recognize Drink Type')
    }
  },

  async userCreate(_, { userId }, { prisma }) {
    try {
      return await prisma.user.create({ data: { id: userId } })
    } catch (err) {
      throw new Error('User already exists')
    }
  },
}
