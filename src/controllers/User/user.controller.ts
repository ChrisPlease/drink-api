import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { User } from '../../models'
import { CrudController } from '../controller'

export class UserController extends CrudController {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const { username, email, password } = req.body

      const user = await User.create({ username, email, password })

      res.json(user)

    } catch (err) {
      res.status(400).json(err)
    }
  }
  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const users = await User.findAll()
      res.json(users)
    } catch (err) {
      res.status(400).json(err)
    }
    res.json({ title: 'foo' })
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
