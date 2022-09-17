import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { DateLog, Drink, Entry } from '../models'
import { EntryModel } from '../models/Entry.model'
import { dataFormatter } from '../utils/serializer'
import type { Controller } from './interfaces'

export class EntryController implements Controller {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const user = { type: 'user', id: req.user?.id }
      const { drink, ...rest } = req.body

      let entry = await Entry.create(rest)

      if (entry) {
        await Promise.all([
          entry.setUser(user.id),
          entry.setDrink(drink.id),
          entry.createLog(),
        ])
      }

      entry = await Entry.findByPk(entry.id, {
        include: [
          { model: Drink, attributes: { exclude: ['userId'] } },
          { model: DateLog, attributes: { exclude: ['entryId'] } },
        ],
        attributes: { exclude: ['drinkId', 'userId'] },
      }).then(e => e?.toJSON()) as EntryModel
      const serializedEntry = dataFormatter.serialize({ stuff: entry, includeNames: ['drink'] })

      res.json({ entry, serializedEntry })
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  }

  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const userId = req.user?.id
      const drinkId = req.query.drinkId ? +req.query.drinkId : null
      const { entries, count } = await Entry.findAndCountAll({
        distinct: true,
        where: {
          userId,
          ...(drinkId ? { drinkId } : {}),
        },
        include: [
          { model: Drink, attributes: { exclude: ['userId'] } },
          { model: DateLog },
        ],
        attributes: {
          exclude: ['userId', 'drinkId'],
        },
      }).then(({ rows, count }) => ({ entries: rows.map(e => e.toJSON()), count }))

      const serializedEntries = dataFormatter.serialize({ stuff: entries, includeNames: ['drink', 'user'] })
      res.json({ ...serializedEntries, meta: { records: count } })
    } catch (err) {
      res.status(400).json(err)
    }
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  public readById(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
