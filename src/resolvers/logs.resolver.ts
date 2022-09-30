import { GraphQLFieldResolver } from 'graphql'
import { EntryModel } from '../models/Entry.model'
import { AppContext } from '../types/context'

export const logsResolver: GraphQLFieldResolver<any, AppContext, any, any> = async (
  parent: EntryModel | undefined,
) => {
  return await parent?.getLogs({ joinTableAttributes: [] })
}
