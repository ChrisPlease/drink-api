import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { User } from '../../models'
import { UserModel } from '../../models/User.model'
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
  public async readById(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const user = await User.findByPk(req.params.id)

      if (!user) {
        res.status(404).json({ message: 'user not found' })
      }
      res.json(user)
    } catch (err) {
      res.status(404).json({})
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    await res.json({ message: 'method not implemented' })
  }
  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const userId = (req.user as UserModel).id

      if (+req.params.id === userId) {
        await User.destroy({ where: { id: userId } })
        res.status(201).json({})
      } else {
        res.status(403).json({ message: 'Lack Permissions' })
      }
    } catch (err) {
      res.status(400).json('error')
    }
  }
}
