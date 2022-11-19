import { GraphQLFieldResolver } from 'graphql'
import { DateLog, EntryLog, sequelize } from '../models'
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

export const logVolumeHistoryResolver: GraphQLFieldResolver<any, AppContext, any, any> = async (
  parent: EntryModel | undefined,
) => {
  const entryId = parent?.id
  const logHistory = await DateLog.findAll({
    group: 'volume',
    order: [['count', 'desc'], ['timestamp', 'desc']],
    attributes: [
      'volume',
      [sequelize.fn('count', sequelize.col('id')), 'count'],
      [sequelize.fn('max', sequelize.col('entry_timestamp')), 'timestamp'],
    ],
    where: { entryId },
  }).then(
    (history: Record<string, any>) => history
      .map((h: any) => ({ count: +h.count || 0, ...h.toJSON() })),
  )

  return logHistory || []
}
