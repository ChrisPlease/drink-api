import { GraphQLFieldResolver } from 'graphql'
import { DateLog, Entry } from '../models'
import { EntryModel } from '../models/Entry.model'
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
  parent,
  args,
  { req: { user }},
) => {
  const userId = user?.id
  let entries: EntryModel[] = []

  entries = await Entry.findAll({
    order: [['count', 'desc']],
    where: {
      userId,
    },
    include: [{ model: DateLog, through: {}}],
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
