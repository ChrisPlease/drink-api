import { Prisma, PrismaClient, Entry, Drink } from '@prisma/client'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import {
  toCursorHash,
  fromCursorHash,
  encodeCursor,
  getCursor,
  deconstructId,
} from '@/utils/cursorHash'
import {
  convertEntryToOz,
  volumeToServings,
} from '@/utils/unit-conversions'
import {
  DrinkNutrition,
  MutationEntryCreateArgs,
  MutationEntryDeleteArgs,
  QueryEntriesArgs,
} from '@/__generated__/graphql'
import { ResolvedEntry } from '@/types/models'

export function Entries(prismaEntry: PrismaClient['entry']) {
  return Object.assign(prismaEntry, {

    async findUniqueWithNutrition(
      entryId: string,
      userId: string,
    ): Promise<ResolvedEntry> {
      const [,id] = deconstructId(entryId)
      const {
        id: _,
        drink,
        ...entry
      } = await prismaEntry.findUnique({
        where: { id_userId: { userId, id } },
        include: {
          drink: {
            include: {
              nutrition: {
                select: {
                  servingSize: true,
                  servingUnit: true,
                  metricSize: true,
                },
              },
            },
          },
        },
      }) || {} as Prisma.EntryGetPayload<{
        include: {
          drink: {
            include: {
              nutrition: true,
            },
          },
        },
      }>

      return {
        id: entryId,
        servings: volumeToServings(entry?.volume, drink?.nutrition?.metricSize),
        ...entry,
      }
    },

    async findWithNutrition(
      args: Prisma.EntryFindManyArgs,
    ): Promise<ResolvedEntry[]> {
      const entries = await prismaEntry.findMany({
        ...args,
        include: {
          drink: {
            select: {
              nutrition: {
                select: {
                  servingSize: true,
                  servingUnit: true,
                  metricSize: true,
                },
              },
            },
          },
        },
      })

      return entries.map(({ id, drink: { nutrition }, ...entry }) => {

        return {
          id: toCursorHash(`Entry:${id}`),
          servings: volumeToServings(entry?.volume, nutrition?.metricSize),
          ...entry,
        }
      })
    },

    async findDrinkByEntryId(parentId: string) {
      const [,id] = deconstructId(parentId)
      const {
        _count: { ingredients },
        ...drink
      } = <Drink & { _count: { ingredients: number } }>await prismaEntry.findUnique({
        where: { id },
      }).drink({ include: { _count: { select: { ingredients: true } } } })
      return {
        ...drink,
        id: toCursorHash(`${ingredients > 0 ? 'Mixed' : 'Base'}Drink:${drink.id}`),
      }
    },

    async findUserByEntryId(parentId: string) {
      const [,id] = deconstructId(parentId)
      return await prismaEntry
        .findUnique({
          where: {
            id,
          },
        }).user()
        .then(({ ...user }) => ({
          ...user,
          id: toCursorHash(`User:${user.id}`),
        }))
    },

    async findManyPaginated(
      client: PrismaClient,
      args: QueryEntriesArgs & { userId: string },
    ) {

      const {
        first,
        sort,
        filter,
        last,
        before,
        after,
        drinkId: hashedDrinkId,
        userId,
      } = args

      const {
        limit,
        distinct,
        search,
      } = filter || { limit: null, distinct: false, search: undefined }

      const [,drinkId] = hashedDrinkId ? deconstructId(hashedDrinkId) : ''

      const orderBy = <Prisma.EntryOrderByWithRelationInput>(
        sort
          ? Object.keys(sort)[0] === 'drink'
            ? { drink: { name: sort.drink } } : sort
          : { drink: { name: 'desc' } }
      )

      const sortKey = Object.keys(orderBy)[0]
      let cursorKey = sortKey as keyof Prisma.EntryWhereUniqueInput

      switch (sortKey) {
        case 'volume':
          cursorKey += '_id'
          break
        case 'drink':
          cursorKey += 'Id_id'
          break
        default:
          break
      }

      const { orderBy: orderByArg, ...baseArgs }: Prisma.EntryFindManyArgs = {
        where: {
          AND: [
            { userId },
            { deleted: false },
            ...(hashedDrinkId ? [{ drinkId }] : []),
            ...(limit ? [{ timestamp: { gt: limit } }] : []),
            ...(search ? [{ drink: { name: { contains: search, mode: 'insensitive' as const } }}] : []),
          ],
        },
        orderBy,
      }

      if (distinct) {
        baseArgs.distinct = ['volume', 'drinkId']
      }

      return await findManyCursorConnection<Entry, Prisma.EntryWhereUniqueInput>(
        (args) => this.findWithNutrition({
          ...args,
          orderBy: orderByArg,
          ...baseArgs,
        }),
        async () => {
          let count = 0
          if (distinct) {
            ([{ count }] = await client.$queryRaw<{ count: number }[]>`
            SELECT COUNT(DISTINCT (volume)) FROM entries WHERE user_id = ${
              userId
            } AND deleted = false ${
              drinkId ? Prisma.sql`AND drink_id = ${drinkId}::uuid` : Prisma.empty
            }
            `)
          } else {
            count = await prismaEntry.count(
              { ...baseArgs } as Omit<Prisma.EntryCountArgs, 'select' | 'include'>,
            )
          }
          return count
        },
        { first, last, before, after },
        {
          getCursor: (record) => getCursor<Entry, Prisma.EntryWhereUniqueInput>(record, cursorKey),
          encodeCursor: (cursor) => {
            const dehashedCursor = encodeCursor(cursor, ['id'])
            return toCursorHash(JSON.stringify(dehashedCursor))
          },
          decodeCursor: (cursorString) => JSON.parse(fromCursorHash(cursorString)),
        },
      )
    },

    async createEntry(
      args: MutationEntryCreateArgs & { userId: string },
      prismaDrink: PrismaClient['drink'],
    ): Promise<ResolvedEntry> {

      const {
        drinkId,
        volume: inputVolume,
        unit,
        userId,
      } = args
      const [,id] = deconstructId(drinkId)

      const {
        servingUnit,
        servingSize,
        metricSize,
      } = await prismaDrink
        .findUnique({ where: { id } }).nutrition() ?? {} as DrinkNutrition

      const volume = convertEntryToOz(
        inputVolume,
        {
          servingSize,
          servingUnit,
          metricSize,
        },
        unit,
      )

      const {
        id: entryId,
        volume: _,
        ...rest
      } = await prismaEntry.create({
        data: {
          volume,
          drinkId: id,
          userId,
        },
      })

      return {
        id: toCursorHash(`Entry:${entryId}`),
        volume,
        servings: volumeToServings(volume, metricSize),
        ...rest,
      }
    },

    async deleteAndReturn(
      args: MutationEntryDeleteArgs & { userId: string },
      client: PrismaClient,
    ): Promise<ResolvedEntry> {
      const { userId, id: entryId } = args
      const [,id] = deconstructId(entryId)

      return await client.$transaction(async (tx) => {
        const { drinkId, ...deletedEntry } = await tx.entry.delete({
          where: { id_userId: { id, userId } },
        })

        const { metricSize } = await tx.drink.findUnique({
          where: { id: drinkId },
        }).nutrition() ?? {} as DrinkNutrition

        return {
          ...deletedEntry,
          drinkId,
          id,
          servings: volumeToServings(deletedEntry.volume, metricSize),
        }
      })
    },
  })
}

