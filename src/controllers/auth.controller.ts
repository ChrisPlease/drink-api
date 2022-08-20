import { Request, Response } from 'express'
import { UniqueConstraintError, ValidationError } from 'sequelize'
import { User } from '../models'

export class AuthController {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const user = User.build(req.body)

      await user.save()
      res.status(201).json(user)
    } catch (err: any) {
      if (err instanceof UniqueConstraintError) {
        const fieldName = Object.keys(err.fields)[0]
        res.status(409).json({ message: `${fieldName} already taken. Please use a different ${fieldName}.` })
      } else if (err instanceof ValidationError) {
        res.status(400).json({ message: err.message })
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const user = await User.findByPk(req.user?.id)

    res.status(201).json(user)
  }

  async logout(req: Request, res: Response): Promise<void> {
    req.logout(err => {
      if (err) {
        res.status(400).json({ message: 'Something went wrong' })
      }
    })

    res.status(201).json({ message: 'Logged out' })
  }
}
