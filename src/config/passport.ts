import { Router } from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { User } from '../models/index'
import { UserModel } from '../models/User.model'

export const router = Router({
  strict: true,
})

passport.use(new LocalStrategy(async (username, password, cb) => {
  try {
    console.log(username)
    const user = await User.findOne({ where: { username } })

    if (!user || password !== user.password) {
      return cb(null, false, { message: 'Something went wrong' })
    }

    return cb(null, user)

  } catch (err) {
    return cb({ message: err })
  }
}))


passport.serializeUser((user, done) => {
  done(null, (user as UserModel).id)
})

passport.deserializeUser(async (id: number, done) => {
  await User.findByPk(id).then(function(user) { done(null, user) })
})
