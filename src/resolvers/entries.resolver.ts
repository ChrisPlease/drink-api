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
  { req: { user } },
) => {
  const userId = user?.id
  let entries: EntryModel[] = []

  entries = await Entry.findAll({ where: { userId }, include: [{ model: DateLog }] })

  return entries
}
