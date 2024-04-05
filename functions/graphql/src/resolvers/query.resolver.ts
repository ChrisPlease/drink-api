import { LambdaClient, InvokeCommand, LambdaClientConfig } from '@aws-sdk/client-lambda'
import { Drink, Entry, User } from '@prisma/client'
import { DrinkHistory as DrinkHistoryModel, ScanDrink } from '@/types/models'
import { QueryResolvers } from '@/__generated__/graphql'
import { Entries } from '@/models/Entry.model'
import { DrinkHistory } from '@/models/History.model'
import { Drinks } from '@/models/Drink.model'
import {
  deconstructId,
  toCursorHash,
} from '@/utils/cursorHash'

const isLocal = process.env.AWS_SAM_LOCAL === 'true'

const clientOptions: LambdaClientConfig = {
  region: process.env.AWS_REGION,
}

if (isLocal) {
  clientOptions.endpoint = 'http://host.docker.internal:3001'
}

export const queryResolvers: QueryResolvers = {
  async node(_, { id: argId }, { prisma, user }) {
    const [__typename,id] = deconstructId(argId)
    const userId = <string>user

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
      default:
        return {} as any
    }
  },

  async drink(_, { id }, { prisma/* , redis */ }) {
    /* const res = await redis.get(`drinks:${id}`)

    if (res) {
      return JSON.parse(res)
    } */

    const drink = await Drinks(prisma.drink)
      .findUniqueById(id)

    // await redis.set(`drinks:${id}`, JSON.stringify(drink))

    return drink
  },

  async drinks(_, args, { prisma, user }) {
    return await Drinks(prisma.drink).findManyPaginated({ ...args }, <string>user)
  },

  async entry(_, { id: entryId }, { prisma, /* redis,  */user }) {
    const userId = <string>user
    /* const res = await redis.get(`entries:${userId}:${entryId}`)
    if (res) {
      return JSON.parse(res)
    }
 */
    const entry = await Entries(prisma.entry).findUniqueWithNutrition(entryId, userId)

    /* await redis.set(`entries:${userId}:${entryId}`, JSON.stringify(entry)) */

    return entry
  },

  async entries(_, args,  { prisma, user }) {
    return await Entries(prisma.entry).findManyPaginated(prisma, { ...args, userId: <string>user })
  },

  async drinkHistory(_, { id: drinkId }, { prisma, /* redis,  */user }) {
    // const userId = <string>user
    /* const redisKey = `drinkHistory:${userId}:${drinkId}`

    const res = await redis.get(redisKey)

    if (res) {
      return JSON.parse(res)
    }
 */
    const drinkHistory = await DrinkHistory(prisma).findUniqueDrinkHistory(drinkId, <string>user)

    /* await redis.set(redisKey, JSON.stringify(drinkHistory)) */

    return drinkHistory as DrinkHistoryModel
  },

  async drinksHistory(_, args, { prisma, user }) {
    return await DrinkHistory(prisma).findManyPaginated({ ...args, userId: <string>user })
  },

  async me(parent, args, { prisma, user }) {
    const id = <string>user
    const userModel = prisma.user.findUnique({ where: { id }})
    return userModel?.then(({ ...user }) => ({ ...user, id: toCursorHash(`User:${id}` )}))
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

    const lambdaClient = new LambdaClient(clientOptions)
    const cmd = new InvokeCommand({
      FunctionName: 'NutritionixApiFunction',
      InvocationType: 'RequestResponse',
      Payload: new TextEncoder().encode(JSON.stringify({ upc })),
    })
    const { Payload } = await lambdaClient.send(cmd)
    return <ScanDrink>JSON.parse(Buffer.from(Payload!).toString())
  },
}


