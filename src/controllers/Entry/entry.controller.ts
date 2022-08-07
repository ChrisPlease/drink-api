import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { DateLog, Entry } from '../../models'
import { CrudController } from '../controller'

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
  public read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }
  public readById(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  public update(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>): Promise<void> {
    throw new Error('Method not implemented.')
  }
  public delete(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
