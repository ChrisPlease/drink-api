import { Request, Response } from 'express'
import { User } from '../models'

export class AuthController {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      await User.create(req.body)
      res.status(201).json({})
    } catch (err) {
      res.status(400).json(err)
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
