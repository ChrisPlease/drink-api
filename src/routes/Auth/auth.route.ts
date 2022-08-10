import { Router } from 'express'
import passport from 'passport'
import { authController } from '../../controllers'

export const router = Router({
  strict: true,
})

router.post(
  '/signup',
  (req, res) => authController.signup(req, res),
)

router.post(
  '/login',
  passport.authenticate('local'),
  (req, res) => authController.login(req, res),
)
