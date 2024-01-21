import { PrismaClient } from '@prisma/client'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import { queryDrinkHistory } from '@/graphql/src/utils/queries'
import { roundNumber } from '@/graphql/src/utils/roundNumber'
import { deconstructId, toCursorHash } from '@/graphql/src/utils/cursorHash'
import { QueryDrinksHistoryArgs, DrinkHistory as DrinkHistoryModel } from '@/graphql/src/__generated__/graphql'
import { DrinkHistory } from '@/graphql/src/types/models'

export function DrinkHistory(client: PrismaClient) {
  return Object.assign({}, {
    async findUniqueDrinkHistory(
      drinkHistoryId: string,
      userId: string,
    ): Promise<DrinkHistoryModel> {

      const [,id] = deconstructId(drinkHistoryId)

      return await client.$transaction(async (tx) => {
        const where = { drinkId: id, userId }
        const entryCount = await tx.entry.groupBy({
          where: { ...where, deleted: false },
          by: ['drinkId', 'userId'],
          _max: {
            timestamp: true,
          },
          _count: true,
          _sum: {
            volume: true,
          },
        })

        const [{
          _count: count,
          _sum: sum,
        }] = entryCount.length ? entryCount : [{ _count: 0, _sum: { volume: 0 } }]

        const {
          coefficient,
        } = await tx.drink.findUnique({
          where: { id },
        }).nutrition() || { coefficient: 1 }

        const volume = sum.volume || 0

        return {
          id: toCursorHash(`DrinkHistory:${id}`),
          count,
          volume,
          water: roundNumber((volume * (coefficient || 1)), 100),
        }
      })
    },

    async findManyPaginated(
      baseArgs: QueryDrinksHistoryArgs & { userId: string },
    ) {
      const {
        filter,
        userId,
        ...pageInfo
      } = baseArgs
    const {
      hasEntries,
      limit,
      search,
    } = filter || { hasEntries: false, limit: null, search: undefined }

    return await findManyCursorConnection(
      async (args): Promise<DrinkHistory[]> => {
        const { take, cursor } = args
        const [,id] = deconstructId(cursor?.id || '')

        return queryDrinkHistory(
          client,
          {
            id,
            limit: limit ? new Date(limit) : null,
            take,
            userId,
            search,
            hasEntries,
          },
        )
        .then(query => query.map(({
          water_volume: water,
          total_volume: volume,
          id,
          ...entry
        }) => ({
          id: toCursorHash(`DrinkHistory:${id}`),
          water,
          volume,
          ...entry,
        })))
      },
      () => client.drink.count(),
      pageInfo,
    )
    },
  })
}
