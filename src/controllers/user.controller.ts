import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { PassportUser } from '../config/passport'
import { AuthError } from '../middleware/authHandler'
import { Drink, User } from '../models'
import { Controller } from './interfaces'

export class UserController implements Controller {
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

      const user = await User.findByPk(
        req.params.id,
        {
          include: {
            model: Drink,
            as: 'drinks',
            attributes: ['name', 'caffeine', 'coefficient'],
          },
        },
      )

      if (!user) {
        throw new Error('foo')
      }
      res.json(user)
    } catch (err) {
      res.status(404).json(err)
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    const userId = (req.user as PassportUser).id
    const { password } = req.body

    if (+req.params.id !== userId) {
      throw new AuthError(403, 'insufficient perms')
    }

    try {
      const user = await User.findByPk(userId)

      if (user) {
        user.password = password
        await user.save()

        res.status(201).json({ message: 'user has been updated' })
      }

    } catch (err) {
      console.log(err)
    }
  }

  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const userId = req.user?.id

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
