import { GraphQLFieldResolver } from 'graphql'
import { DateLog } from '../database/entities/DateLog.entity'
import { Drink } from '../database/entities/Drink.entity'
import { Entry } from '../database/entities/Entry.entity'
import { User } from '../database/entities/User.entity'
import { dataSource } from '../database/data-source'
import { AppContext } from '../types/context'

const entryRepository = dataSource.getRepository(Entry)
const logRepository = dataSource.getRepository(DateLog)

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

  const drink = await drinkRepository.findOneBy({ id: drinkId, userId })

  if (!drink) {
    throw new Error('Drink does not belong to you')
  }

  console.log('-------------------------------')
  console.log('DRINK: ', drink)
  console.log('-------------------------------')

  const { id } = await entryRepository
    .createQueryBuilder('entry')
    .insert()
    .into(Entry)
    .values({
      userId,
      drinkId,
      count: () => `COALESCE((SELECT count+1 FROM entries WHERE drink_id = '${
        drinkId
      }' AND user_id = '${
        userId
      }'),1)`,
    })
    .orUpdate(
      ['count'],
      ['drink_id', 'user_id'],
    )
    .returning(['id'])
    .execute()
    .then(res => res.raw[0])

  const entry = await entryRepository.findOneBy({ id })

  if (entry) {
    const log = new DateLog()
    log.entryId = entry.id
    log.volume = volume

    await logRepository.save(log)
  }

  return entry
}
