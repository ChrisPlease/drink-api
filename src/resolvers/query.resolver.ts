import { Drink, Entry, User } from '@prisma/client'
import { DrinkHistory as DrinkHistoryModel, ScanDrink } from '@/types/models'
import { QueryResolvers } from '@/__generated__/graphql'
import { Entries } from '@/models/Entry.model'
import { DrinkHistory } from '@/models/History.model'
import { Drinks } from '@/models/Drink.model'
import { fetchItem } from '@/services/nutritionix'
import {
  deconstructId,
  toCursorHash,
} from '@/utils/cursorHash'

export const queryResolvers: QueryResolvers = {
  async node(_, { id: argId }, { prisma, req: { auth } }) {
    const [__typename,id] = deconstructId(argId)
    const userId = <string>auth?.sub

    switch (__typename) {
      case 'User':
        return <User>await prisma.user.findUnique({ where: { id } }).then(({ ...rest }) => ({
          ...rest,
          id: argId,
        })) || null
      case 'MixedDrink':
      case 'BaseDrink':
        return <Drink>await Drinks(prisma.drink)
          .findUniqueById(argId)
      case 'DrinkHistory':
        return <DrinkHistoryModel>await DrinkHistory(prisma)
          .findUniqueDrinkHistory(argId, userId)
      case 'Entry':
        return <Entry>await Entries(prisma.entry)
          .findUniqueWithNutrition(argId, userId)
    }
  },

  async drink(_, { id }, { prisma, redis }) {
    const res = await redis.get(`drinks:${id}`)

    if (res) {
      return JSON.parse(res)
    }

    const drink = await Drinks(prisma.drink)
      .findUniqueById(id)

    await redis.set(`drinks:${id}`, JSON.stringify(drink))

    return drink
  },

  async drinks(_, args, { prisma, req: { auth } }) {
    return await Drinks(prisma.drink).findManyPaginated({ ...args }, <string>auth?.sub)
  },

  async entry(_, { id: entryId }, { prisma, redis, req: { auth } }) {
    const userId = <string>auth?.sub
    const res = await redis.get(`entries:${userId}:${entryId}`)
    if (res) {
      return JSON.parse(res)
    }

    const entry = await Entries(prisma.entry).findUniqueWithNutrition(entryId, userId)

    await redis.set(`entries:${userId}:${entryId}`, JSON.stringify(entry))

    return entry
  },

  async entries(_, args,  { prisma, req: { auth } }) {
    return await Entries(prisma.entry).findManyPaginated(prisma, { ...args, userId: <string>auth?.sub })
  },

  async drinkHistory(_, { id: drinkId }, { prisma, redis, req: { auth } }) {
    const userId = <string>auth?.sub
    const redisKey = `drinkHistory:${userId}:${drinkId}`

    const res = await redis.get(redisKey)

    if (res) {
      return JSON.parse(res)
    }

    const drinkHistory = await DrinkHistory(prisma).findUniqueDrinkHistory(drinkId, <string>auth?.sub)

    await redis.set(redisKey, JSON.stringify(drinkHistory))

    return drinkHistory
  },

  async drinksHistory(_, args, { prisma, req: { auth } }) {
    return await DrinkHistory(prisma).findManyPaginated({ ...args, userId: <string>auth?.sub })
  },

  async me(parent, args, { prisma, req: { auth } }) {
    const id = <string>auth?.sub
    const user = prisma.user.findUnique({ where: { id }})
    return user?.then(({ ...user }) => ({ ...user, id: toCursorHash(`User:${id}` )}))
  },

  async user(parent, { id: userId }, { prisma }) {
    const id = toCursorHash(`User:${userId}`)
    const user = prisma.user.findUnique({ where: { id: userId } })

    return user?.then(({ ...user }) => ({ ...user, id }))
  },

  async users(parent, args, { prisma }) {
    const users = prisma.user.findMany()

    return users?.then(users => users.map(
      ({ ...user }) => ({ ...user, id: toCursorHash(`User:${user.id}` )})),
    )
  },

  async drinkScan(_, { upc }, { prisma }) {
    const drink = <Drink>await prisma.drink.findUnique({ where: { upc } })

    if (drink) return { ...drink, id: toCursorHash(`BaseDrink:${drink.id}`) } as Drink

    return <ScanDrink>await fetchItem({ upc })
  },
}

