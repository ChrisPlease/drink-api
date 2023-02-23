import { Prisma, Drink, User } from '@prisma/client'
import { GraphQLFieldResolver } from 'graphql'
import { AppContext } from '../types/context'
import { EntryResolvers } from '../__generated__/graphql'

export const entryResolver: GraphQLFieldResolver<any, AppContext, { id: string }> = async (
  parent,
  { id },
) => {

  throw new Error('not yet implemented')
  // return await entryRepository.findOneBy({ id })
}

export const entriesResolver: GraphQLFieldResolver<unknown, AppContext, { drinkId: string }, any> = async (
  parent,
  { drinkId },
  { prisma, req: { auth } },
) => {
  const userId = auth?.sub

  return await prisma.entry.findMany({
    where: {
      userId,
      drinkId: drinkId ? drinkId : undefined,
    },
  })
}

const foo = `#graphql
type Drink {
  name:
}

`

export const drinkEntriesResolver: GraphQLFieldResolver<any, AppContext, { drinkId: string }, any> = async (
  parent: unknown,
  { drinkId },
  { prisma, req: { auth } },
) => {
  const userId = <string>auth?.sub

  const entries = await prisma.entry.groupBy({
    where: {
      userId,
      drinkId: drinkId ? drinkId : undefined,
    },
    by: ['drinkId', 'userId'],
    _count: true,
    _sum: {
      volume: true,
    },
    _max: {
      timestamp: true,
    },
    orderBy: {
      _max: {
        timestamp: 'desc',
      },
    },
  })

  console.log(entries)

  return entries.map(entry => ({
    ...entry,
  }))

  console.log('hhhhhheeeeere ', entries)
  throw new Error('Not yet implemented!')
  // const userId = auth?.sub
  // const entries = await entryRepository
  //   .find({
  //     where: {
  //       ...(userId ? { userId } : {}),
  //     },
  //   })

  // const foo = await entryRepository
  //   .createQueryBuilder('entry')
  //   .where('entry.user_id = :userId', { userId })
  //   .select('drink_id')
  //   .addSelect((qb) => {
  //     return qb
  //       .select('COUNT(id)')
  //       .from(Entry, 'e')
  //       .where('e.drink_id = drink.id')
  //       .innerJoin(Drink, 'drink')
  //   } )
  //   .addSelect('MAX(timestamp)', 'timestamp')
  //   .groupBy('drink_id')
  //   // .getMany()

  // console.log('entries', entries)
  // console.log('raw', foo.getQuery())
}

export const entryCreateResolver: GraphQLFieldResolver<
  any,
  AppContext,
  {
    entry: {
      drinkId: string,
      volume: number,
    },
  },
  any
> = async (
  parent,
  { entry: { drinkId, volume } },
  { req: { auth }, prisma },
) => {
  const userId = <string>auth?.sub

  return await prisma.entry.create({
    data: {
      userId,
      drinkId,
      volume,
    },
  })
}
