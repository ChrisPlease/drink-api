import { GraphQLFieldResolver } from 'graphql'
import { User } from '../models'
import { UserModel } from '../models/User.model'
import { AppContext } from '../types/context'

export const userCreateResolver: GraphQLFieldResolver<any, AppContext> = async (
  _,
  __,
  { req: { auth } },
) => {
  let user: UserModel | null

  if (auth?.sub) {
    user = await User.findByPk(auth?.sub)

    if (!user) {
      user = await User.create({ id: auth?.sub })
    }
    return user
  }

  throw new Error('No Auth token found')
}

export const userResolver: GraphQLFieldResolver<any, AppContext, { id: number }> = async (
  parent,
  { id },
  { req },
) => {
  return await User.findByPk(id || req.auth?.sub) as UserModel
}

export const usersResolver: GraphQLFieldResolver<any, AppContext, any, any> = async () => {
  return await User.findAll()
}
