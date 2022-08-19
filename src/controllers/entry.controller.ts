import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { DateLog, Drink, Entry } from '../models'
import type { Controller } from './interfaces'

export class EntryController implements Controller {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const userId = req.user?.id
      const entry = await Entry.create({ ...req.body, userId }, {
        include: { model: DateLog },
      })

      if (entry) {
        entry.createLog()
      }

      res.json(entry)
    } catch (err) {
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
      const entries = await Entry.findAll({
        where: {
          userId,
          ...(drinkId ? { drinkId } : {}),
        },
        attributes: ['drink.name', 'volume', 'log.entry_timestamp'],
        include: [
          {
            model: DateLog,
            attributes: ['entryTimestamp'],
          },
          {
            model: Drink,
            attributes: ['name'],
          },
        ],
      })

      res.json(entries)
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