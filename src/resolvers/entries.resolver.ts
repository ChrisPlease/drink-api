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

export const entriesResolver: GraphQLFieldResolver<any, AppContext, any, any> = async (
  parent: DrinkModel | UserModel | undefined,
  args,
  { req: { user }},
) => {
  const drinkId = parent instanceof DrinkModel && parent?.id
  const userId = parent instanceof UserModel && parent?.id

  let entries: EntryModel[] = []

  entries = await Entry.findAll({
    order: [['count', 'desc'], ['updatedAt', 'desc']],
    where: {
      ...(drinkId ? { drinkId } : {}),
      ...(userId ? { userId } : { userId: user?.id }),
    },
  })

  return entries
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
  { entry: { drinkId, volume }},
  { req: { user }},
) => {
  const userId = user?.id
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
