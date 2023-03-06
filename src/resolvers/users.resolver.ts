import { GraphQLFieldResolver } from 'graphql'
import { AppContext } from '../types/context'

export const userCreateResolver: GraphQLFieldResolver<any, AppContext> = async (
  _,
  __,
  { req: { auth }, res },
) => {
  // const userRepository = dataSource.getRepository(User)
  // let user: User | null

  // if (auth?.sub) {
  //   if (await userRepository.exist({ where: { id: auth?.sub }})) {
  //     // res.status(400).json({ message: 'User already exists' })
  //     throw new Error('User already exists!')
  //     return
  //   } else {
  //     user = userRepository.create({ id: auth?.sub })
  //     await user.save()

  //     return user
  //   }
  // }

  throw new Error('No Auth token found')
}

export const userResolver: GraphQLFieldResolver<any, AppContext, { id: string }> = async (
  parent,
  { id },
  { req },
) => {
  // const userRepository = dataSource.getRepository(User)

  // return await userRepository.findOneBy({ id: id || req.auth?.sub })
}

export const usersResolver: GraphQLFieldResolver<any, AppContext, any, any> = async () => {
  // const userRepository = dataSource.getRepository(User)

  // return await userRepository.find()
}
