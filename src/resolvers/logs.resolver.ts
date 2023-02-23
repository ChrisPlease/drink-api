// import { GraphQLFieldResolver } from 'graphql'
// import { DateLog } from '../database/entities/DateLog.entity'
// import { Entry } from '../database/entities/Entry.entity'
// import { dataSource } from '../database/data-source'
// import { AppContext } from '../types/context'

// const logsRepository = dataSource.getRepository(DateLog)

// export const logsResolver: GraphQLFieldResolver<any, AppContext, any, any> = async (
//   parent: Entry | undefined,
// ) => {
//   const entryId = parent?.id

//   try {
//     return await logsRepository.findBy({ entryId })
//   } catch (err) {
//     console.log(err)
//   }
// }

// // export const logVolumeHistoryResolver: GraphQLFieldResolver<any, AppContext, any, any> = async (
// //   parent: EntryModel | undefined,
// // ) => {
// //   const entryId = parent?.id
// //   const logHistory = await DateLog.findAll({
// //     group: 'volume',
// //     order: [['count', 'desc'], ['timestamp', 'desc']],
// //     attributes: [
// //       'volume',
// //       [sequelize.fn('count', sequelize.col('id')), 'count'],
// //       [sequelize.fn('max', sequelize.col('entry_timestamp')), 'timestamp'],
// //     ],
// //     where: { entryId },
// //   }).then(
// //     (history: Record<string, any>) => history
// //       .map((h: any) => ({ count: +h.count || 0, ...h.toJSON() })),
// //   )

// //   return logHistory || []
// // }
