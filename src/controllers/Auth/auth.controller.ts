import { Request, Response } from "express"
import { User } from "../../models"

export class AuthController {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const user = User.build(req.body)

      console.log(user.toJSON())
      res.status(201).json(user)
    } catch (err) {
      res.status(400).json({})
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    console.log(req.session, req.sessionID)
    console.log(req.user)
    res.json(200)
  }
}
