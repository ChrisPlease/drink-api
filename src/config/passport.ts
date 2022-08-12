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
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return done(new AuthError(400, 'Username does not exist'))
    }

    const isAuth = await user?.authenticate(password)

    if (!isAuth) {
      return done(new AuthError(401, 'Incorrect credentials'))
    }

    console.log('have the user')
    return done(null, user)

  } catch (err) {
    return done({ message: `error: ${err}` })
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
