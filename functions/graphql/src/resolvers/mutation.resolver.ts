import { Drink } from '@prisma/client'
import { Drinks } from '@/graphql/src/models/Drink.model'
import { Entries } from '@/graphql/src/models/Entry.model'
import { MutationResolvers } from '@/graphql/src/__generated__/graphql'
import { deconstructId } from '@/graphql/src/utils/cursorHash'

export const mutationResolvers: MutationResolvers = {
  async entryCreate(_, args, { prisma, user }) {

    return await Entries(prisma.entry)
      .createEntry({ ...args, userId: <string>user }, prisma.drink)
  },

  async entryDelete(_, args, { prisma, /* redis,  */user }) {
    /* const userId = <string>user */
    /* const redisKey = `entries:${userId}:${args.id}`

    await redis.del(redisKey) */

    const res = Entries(prisma.entry)
      .deleteAndReturn({ ...args, userId: <string>user }, prisma)

    /* await redis.set(redisKey, JSON.stringify(res)) */

    return res
  },

  async drinkCreate(_, { drinkInput }, { prisma,/*  redis, */ user }) {
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
        { userId, nutrition, ingredients, ...rest },
        prisma,
      )
    } else {
      res = await drink.createWithNutrition({ userId, nutrition, ...rest }) || null
    }

    /* if (res) {
      await redis.set(`drinks:${res?.id}`, JSON.stringify(res))
    } */

    return res
  },

  async drinkEdit(
    _,
    {
      drinkInput: {
        nutrition,
        ingredients,
        ...drinkInput
      },
    }, { prisma, /* redis,  */user }) {
    let res: Drink | null

    // const hasNutrition = !!caffeine || !!sugar || !!coefficient
    const drink = Drinks(prisma.drink)
    const userId = <string>user
    // const redisKey = `drinks:${drinkInput.id}`

    if (!drinkInput.id) throw new Error('Drink ID required')
    const [type,id] = deconstructId(drinkInput.id)

    try {
      await prisma.drink.findUniqueOrThrow({ where: { id_userId: { id, userId } } })
    } catch (err) {
      throw new Error('Drink not found')
    }

    /* await redis.del(redisKey) */

    if (type === 'MixedDrink') {
      // if (hasNutrition) throw new Error('Cannot add nutrition to a Mixed Drink')
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

      if (Object.values(nutrition || {}).some(item => item) && !nutrition?.servingSize) {
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

    /* await redis.set(redisKey, JSON.stringify(res)) */
    return res
  },

  async drinkDelete(_, { id: drinkId }, { prisma, /* redis,  */user }) {
    const userId = <string>user
    /* const redisKey = `drinks:${drinkId}` */

    // await redis.del(redisKey)

    const res = await Drinks(prisma.drink).deleteDrink({ id: drinkId, userId })

    // await redis.set(redisKey, JSON.stringify(res))

    return res
  },

  async userCreate(_, { id: userId }, { prisma }) {
    try {
      return await prisma.user.create({ data: { id: userId } })
    } catch (err) {
      throw new Error('User already exists')
    }
  },
}
