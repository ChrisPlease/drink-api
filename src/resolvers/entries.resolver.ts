import { GraphQLFieldResolver } from 'graphql'
import { DateLog, Entry } from '../models'
import { DrinkModel } from '../models/Drink.model'
import { EntryModel } from '../models/Entry.model'
import { UserModel } from '../models/User.model'
import { AppContext } from '../types/context'

export const entryResolver: GraphQLFieldResolver<any, AppContext, { id: number }> = async (
  parent,
  { id },
) => {
  let entry: EntryModel = {} as EntryModel

  entry = await Entry.findByPk(parent?.id || id) as EntryModel

  return entry
}

export const drinkEntriesResolver: GraphQLFieldResolver<any, AppContext, { drinkId: number }> = async (
  parent,
  { drinkId },
  { req: { auth } },
) => {
  const userId = auth?.sub
  let entry: EntryModel = {} as EntryModel

  ([entry] = await Entry.findCreateFind({ where: { drinkId, userId }}))

  return entry
}

export const entriesResolver: GraphQLFieldResolver<any, AppContext, { drinkId: number }, any> = async (
  parent: DrinkModel | UserModel | undefined,
  { drinkId: id },
  { req: { auth } },
) => {
  const drinkId = parent instanceof DrinkModel && parent?.id
  const userId = parent instanceof UserModel && parent?.id

  let entries: EntryModel[] = []

  entries = await Entry.findAll({
    order: [['updatedAt', 'desc'], ['count', 'desc']],
    where: {
      ...((drinkId || id) ? { drinkId: drinkId || id } : {}),
      ...(userId ? { userId } : { userId: auth?.sub }),
    },
  })

  return entries || []
}

export const entryCreateResolver: GraphQLFieldResolver<
  any,
  AppContext,
  {
    entry: {
      drinkId: number,
      volume: number,
    },
  },
  any
> = async (
  parent,
  { entry: { drinkId, volume } },
  { req: { auth } },
) => {
  const userId = auth?.sub
  let entry: EntryModel

  ([entry] = await Entry.findCreateFind({ where: { drinkId, userId }}))

  if (entry) {
    entry.increment('count')
    await entry.createLog({ volume, entryId: entry.id })
    await entry.save()
    entry = await Entry.findByPk(entry.id, { include: [{ model: DateLog, through: {}}] }) as EntryModel
  }

  return entry
}
