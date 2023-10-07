import { Drink } from '@prisma/client'
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

  async entryDelete(_, args, { prisma, redis, req: { auth } }) {
    const userId = <string>auth?.sub
    const redisKey = `entries:${userId}:${args.entryId}`

    await redis.del(redisKey)

    const res = Entries(prisma.entry)
      .deleteAndReturn({ ...args, userId: <string>auth?.sub }, prisma)

    await redis.set(redisKey, JSON.stringify(res))

    return res
  },

  async drinkCreate(_, { drinkInput }, { prisma, redis, req: { auth } }) {
    let res: Drink | null
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
      res = await drink.createWithIngredients(
        { userId, servingSize, ingredients, ...rest },
        prisma,
      )
    } else {
      res = await drink.createWithNutrition({ userId, ...nutrition, ...rest })
    }

    await redis.set(`drinks:${res?.id}`, JSON.stringify(res))

    return res
  },

  async drinkDelete(_, { drinkId }, { prisma, redis, req: { auth } }) {
    const userId = <string>auth?.sub
    const redisKey = `drinks:${drinkId}`

    await redis.del(redisKey)

    const res = await Drinks(prisma.drink).deleteDrink({ drinkId, userId })

    await redis.set(redisKey, JSON.stringify(res))

    return res
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
    }, { prisma, redis, req: { auth } }) {
    let res: Drink | null

    const hasNutrition = !!caffeine || !!sugar || !!coefficient
    const drink = Drinks(prisma.drink)
    const userId = <string>auth?.sub
    const redisKey = `drinks:${drinkInput.id}`

    if (!drinkInput.id) throw new Error('Drink ID required')
    const [type,id] = deconstructId(drinkInput.id)

    try {
      await prisma.drink.findUniqueOrThrow({ where: { id_userId: { id, userId } } })
    } catch (err) {
      throw new Error('Drink not found')
    }

    await redis.del(redisKey)

    if (type === 'MixedDrink') {
      if (hasNutrition) throw new Error('Cannot add nutrition to a Mixed Drink')
      if (ingredients) {
        res = await Drinks(prisma.drink).updateWithIngredients(
          { userId, ingredients, ...drinkInput },
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
      const nutrition = { caffeine, sugar, coefficient }

      if (Object.values(nutrition).some(item => item) && !servingSize) {
        throw new Error('Serving size is required when editing nutritional values')
      }

      res = await drink.updateWithNutrition({
        userId,
        servingSize,
        ...nutrition,
        ...drinkInput,
      })
    } else {
      throw new Error('Cannot recognize Drink Type')
    }

    res = { ...res, id: drinkInput.id } as Drink

    await redis.set(redisKey, JSON.stringify(res))
    return res
  },

  async userCreate(_, { userId }, { prisma }) {
    try {
      return await prisma.user.create({ data: { id: userId } })
    } catch (err) {
      throw new Error('User already exists')
    }
  },
}
