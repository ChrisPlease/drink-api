import { GraphQLFieldResolver } from 'graphql'
import { DateLog, EntryLog } from '../models'
import { DateLogModel } from '../models/DateLog.model'
import { EntryModel } from '../models/Entry.model'
import { AppContext } from '../types/context'

export const logsResolver: GraphQLFieldResolver<any, AppContext, any, any> = async (
  parent: EntryModel | undefined,
  args,
  { loaders: { logsLoader } },
) => {
  let logs: DateLogModel[] = []
  const entryId = parent?.id

  try {
    logs = await logsLoader.load(entryId) as DateLogModel[]
  } catch (err) {
    logs = await DateLog.findAll({
      include: [{ model: EntryLog, where: { entryId }, as: 'entryLog' }],
    })
  }
  return logs
}
