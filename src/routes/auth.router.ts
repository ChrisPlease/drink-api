import { Router } from 'express'
import { authController } from '../controllers'

export const router = Router({
  strict: true,
})

router.post(
  '/signup',
  (req, res) => authController.signup(req, res),
)

router.post(
  '/login',
  (req, res) =>  authController.login(req, res),
)

router.post(
  '/logout',
  (req, res) => authController.logout(req, res),
)
