import { GraphQLFieldResolver } from 'graphql'
import { Drink } from '../database/entities/Drink.entity'
import { Entry } from '../database/entities/Entry.entity'
import { User } from '../database/entities/User.entity'
import { dataSource } from '../database/data-source'
import { AppContext } from '../types/context'

const entryRepository = dataSource.getRepository(Entry)

export const entryResolver: GraphQLFieldResolver<any, AppContext, { id: string }> = async (
  parent,
  { id },
) => {
  return await entryRepository.findOneBy({ id })
}

export const entriesResolver: GraphQLFieldResolver<any, AppContext, { drinkId: string }, any> = async (
  parent: Drink | User | undefined,
  { drinkId: queryParentId },
  { req: { auth } },
) => {
  const drinkId: string | undefined = parent instanceof Drink ? parent?.id : queryParentId || undefined
  const userId: string | undefined = parent instanceof User ? parent?.id : auth?.sub || undefined

  const entries = await entryRepository.findBy({
    ...(drinkId ? { drinkId } : {}),
    ...(userId ? { userId } : {}),
  })

  return entries || []
}

export const drinkEntriesResolver: GraphQLFieldResolver<any, AppContext, { drinkId: string }, any> = async (
  parent: undefined,
  params,
  { req: { auth } },
) => {
  console.log('hhhhhheeeeere ')
  const userId = auth?.sub
  const entries = await entryRepository
    .find({
      where: {
        ...(userId ? { userId } : {}),
      },
    })

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

  console.log('entries', entries)
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
  { req: { auth } },
) => {
  const userId = <string>auth?.sub

  const drinkRepository = dataSource.getRepository(Drink)

  const drink = await drinkRepository.findOneBy({ id: drinkId })

  if (drink?.userId && drink?.userId !== userId) {
    throw new Error('Drink does not belong to you')
  }

  if (drink) {
    const entry = new Entry()

    entry.userId = userId
    entry.volume = volume
    entry.drinkId = drink.id || drinkId

    return await entry.save()
  }
}
