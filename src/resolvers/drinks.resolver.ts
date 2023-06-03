import {
  BaseDrinkResolvers,
  DrinkResolvers,
  DrinkResultResolvers,
  MixedDrinkResolvers,
} from '@/__generated__/graphql'
import { deconstructId } from '@/utils/cursorHash'
import { Drinks } from '@/models/Drink.model'

export const drinkResultResolvers: DrinkResultResolvers = {
  async __resolveType(parent) {
    const [type] = deconstructId(parent.id)
    return type as 'MixedDrink' | 'BaseDrink'
  },

}

export const drinkResolvers: DrinkResolvers = {
  ...drinkResultResolvers,

  async entries(parent, args, { prisma, redis, req: { auth } }) {
    const userId = <string>auth?.sub
    const redisKey = `drinkEntries:${userId}:${parent.id}`

    const res = await redis.get(redisKey)

    if (res) {
      return JSON.parse(res)
    }

    const entries = await Drinks(prisma.drink)
      .findDrinkEntries(prisma, parent.id, <string>auth?.sub)

    await redis.set(redisKey, JSON.stringify(entries))

    return entries
  },

  async user(parent, args, { prisma }) {
    return await Drinks(prisma.drink).findDrinkUser(parent.id)
  },

}

export const baseDrinkResolvers: BaseDrinkResolvers = {
  ...drinkResolvers,
}

export const mixedDrinkResolvers: MixedDrinkResolvers = {
  ...drinkResolvers,

  async ingredients(parent, args, { prisma }) {
    return await Drinks(prisma.drink).findDrinkIngredients(parent.id)
  },
}
