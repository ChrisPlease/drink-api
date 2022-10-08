import { GraphQLFieldResolver } from 'graphql'
import { User } from '../models'
import { UserModel } from '../models/User.model'
import { AppContext } from '../types/context'

export const userResolver: GraphQLFieldResolver<any, AppContext, { id: number }> = async (
  parent,
  { id },
  { req },
) => {
  return await User.findByPk(id || req.user?.id) as UserModel
}

export const usersResolver: GraphQLFieldResolver<any, AppContext, any, any> = async () => {
  return await User.findAll()
}
