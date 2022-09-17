import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'
import { AuthError } from '../middleware/authHandler'
import { Drink, Entry, User } from '../models'
import { DrinkModel } from '../models/Drink.model'
import { dataFormatter } from '../utils/serializer'
import { Controller } from './interfaces'

export class UserController implements Controller {
  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const { username, email, password } = req.body

      const user = await User.create({ username, email, password }).then(u => u.toJSON())

      const serializedUser = dataFormatter.serialize({ stuff: user })
      res.json(serializedUser)

    } catch (err) {
      res.status(400).json(err)
    }
  }
  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {
      const users = await User.findAll({
        attributes: {
          exclude: ['updatedAt'],
        },
        include: [{
          model: Drink,
          as: 'drinks',
          attributes: { exclude: ['relationshipNames', 'userId'] },
        }]})
        .then(result => result.map(r => r.toJSON()))

      const serializedUsers = dataFormatter.serialize({ stuff: users, includeNames: ['drinks' ]})

      res.json(serializedUsers)
    } catch (err) {
      console.log(err)
      res.status(400).json(err)
    }
  }
  public async readById(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    try {

      const user = await User.findByPk(
        req.params.id,
        {
          include: [
            {
              model: Drink,
              as: 'drinks',
              attributes: {
                exclude: ['userId'],
              },
            },
            {
              model: Entry,
              as: 'entries',
              include: [{ model: Drink }],
            },
          ],
        },
      ).then(u => u?.toJSON()) as DrinkModel

      const serializedUser = dataFormatter.serialize({ stuff: user, includeNames: ['drinks', 'entries'] })

      if (!user) {
        throw new Error('foo')
      }

      res.json(serializedUser)
    } catch (err) {
      res.status(404).json(err)
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>,
  ): Promise<void> {
    const userId = req.user?.id
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
