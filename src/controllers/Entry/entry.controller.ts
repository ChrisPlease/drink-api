import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { DateLog, Drink, Entry, sequelize } from '../../models'
import { CrudController, ICrudController } from '../controller'

export class EntryController extends CrudController {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const entry = await Entry.create(req.body, {
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
      const entries = await Entry.findAll({
        ...(req.query.drinkId ? { where: { drinkId: +req.query.drinkId } } : {}),
        group: 'drink.name',
        attributes: [
          'drink.name',
          [sequelize.fn('SUM', 'entry.volume'), 'total_volume'],
          [sequelize.fn('COUNT', sequelize.col('log.entry_timestamp')), 'foo'],
        ],
        include: [
          { model: Drink },
          { model: DateLog },
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
  public delete(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */
