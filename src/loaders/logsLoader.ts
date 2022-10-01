import DataLoader from 'dataloader'
import { Op } from 'sequelize'
import { DateLog, EntryLog } from '../models'

export const batchLogs = async (keys: readonly number[]) => {
  const logs = await DateLog.findAll({
    include: [{
      model: EntryLog,
      as: 'entryLog',
      required: true,
      where: { entryId: { [Op.in]: keys } },
    }],
  })

  return keys.map(key => logs.filter(
    ({ entryLog }) => key === entryLog.entryId || new Error(`No result for ${key}`),
  ))
}

export const logsLoader = new DataLoader((keys: readonly number[]) => batchLogs(keys))
