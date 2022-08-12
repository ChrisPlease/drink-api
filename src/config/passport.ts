import { Router } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { AuthError } from '../middleware/authHandler'
import { User } from '../models/index'
import { UserModel } from '../models/User.model'

export const router = Router({
  strict: true,
})

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.scope('withPassword').findOne({ where: { username } })
    const isAuth = await user?.authenticate(password)

    if (!isAuth || !user) {
      throw new AuthError(401, 'Invalid credentials. Please try again or sign up')
    }

    return done(null, user)

  } catch (err) {
    return done(err)
  }
}))

interface PassportUser {
  id: number;
  username: string;
}

passport.serializeUser((user, done) => {
  done(null, { id: (user as UserModel).id, name: (user as UserModel).username })
})

passport.deserializeUser(async ({ id }: PassportUser, done) => {
  const user = await User.findByPk(id)
  done(null, user)
})
