import { Prisma, PrismaClient, Entry, Drink } from '@prisma/client'
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection'
import { roundNumber } from '@/utils/roundNumber'
import {
  toCursorHash,
  fromCursorHash,
  encodeCursor,
  getCursor,
  deconstructId,
} from '@/utils/cursorHash'
import { MutationEntryCreateArgs, MutationEntryDeleteArgs, QueryEntriesArgs } from '@/__generated__/graphql'
import { Nutrition } from '@/types/models'

type EntryNutrition = {
  caffeine: number,
  sugar: number,
  waterContent: number,
  servings: number,
}

export function Entries(prismaEntry: PrismaClient['entry']) {
  return Object.assign(prismaEntry, {
    computeNutrition(
      { caffeine, sugar, coefficient, servingSize }: Nutrition,
      volume: number,
    ): EntryNutrition {
      return {
        caffeine: roundNumber(caffeine * (volume / servingSize)),
        sugar: roundNumber(sugar * (volume / servingSize)),
        waterContent: roundNumber(coefficient * volume),
        servings: roundNumber(volume / servingSize) || 0,
      }
    },

    async findUniqueWithNutrition(
      entryId: string,
      userId: string,
    ): Promise<(Entry & { caffeine: number; sugar: number; waterContent: number }) | null> {
      const [,id] = deconstructId(entryId)
      const {
        id: _,
        drink,
        ...entry
      } = await prismaEntry.findUnique({
        where: { id_userId: { userId, id } },
        include: {
          drink: {
            select: {
              caffeine: true,
              sugar: true,
              coefficient: true,
              servingSize: true,
            },
          },
        },
      }) as Entry & { drink: Pick<Drink, 'caffeine' | 'sugar' | 'coefficient' | 'servingSize' > }

      const nutrition = this.computeNutrition(
        {
          caffeine: drink?.caffeine ?? 0,
          sugar: drink?.sugar ?? 0,
          coefficient: drink?.coefficient ?? 0,
          servingSize: drink?.servingSize ?? 1,
        },
        entry?.volume ?? 0,
      )

      return {
        id: entryId,
        ...entry,
        ...nutrition,
      }
    },

    async findWithNutrition(
      args: Prisma.EntryFindManyArgs,
    ): Promise<(Entry & { caffeine: number; sugar: number; waterContent: number })[]> {
      const entries = await prismaEntry.findMany({
        ...args,
        include: {
          drink: {
            select: {
              caffeine: true,
              sugar: true,
              coefficient: true,
              servingSize: true,
            },
          },
        },
      })

      return entries.map(({ id, drink, ...entry }) => {
        const nutrition = this.computeNutrition(
          {
            caffeine: drink?.caffeine ?? 0,
            sugar: drink?.sugar ?? 0,
            coefficient: drink?.coefficient ?? 0,
            servingSize: drink?.servingSize ?? 0,
          },
          entry.volume,
        )

        return {
          id: toCursorHash(`Entry:${id}`),
          ...nutrition,
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
              { ...baseArgs } as Omit<Prisma.EntryFindManyArgs, 'select' | 'include'>,
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

    async createWithNutrition(
      args: MutationEntryCreateArgs & { userId: string },
    ) {
    const { drinkId, volume, userId } = args
    const [,id] = deconstructId(drinkId)

    const {
      id: entryId,
      drink: {
        caffeine,
        sugar,
        coefficient,
        servingSize,
      },
      ...rest
    } = await prismaEntry.create({
      data: {
        volume,
        drinkId: id,
        userId,
      },
      include: {
        drink: {
          select: {
            caffeine: true,
            coefficient: true,
            sugar: true,
            servingSize: true,
          },
        },
      },
    })

    const nutrition = this.computeNutrition({
      sugar: sugar ?? 0,
      coefficient: coefficient ?? 1,
      caffeine: caffeine ?? 0,
      servingSize: servingSize ?? 1,
    }, volume)

    return {
      id: toCursorHash(`Entry:${entryId}`),
      ...nutrition,
      ...rest,
    }
    },

    async deleteAndReturn(
      args: MutationEntryDeleteArgs & { userId: string },
      client: PrismaClient,
    ) {
      const { userId, id: entryId } = args
      const [,id] = deconstructId(entryId)

      return await client.$transaction(async (tx) => {
        const { drinkId, ...deletedEntry } = await tx.entry.delete({
          where: { id_userId: { id, userId } },
        })

        const drink = await tx.drink.findUnique({
          where: { id: drinkId },
          select: {
            caffeine: true,
            sugar: true,
            coefficient: true,
            servingSize: true,
          },
        })

        return {
          ...deletedEntry,
          drinkId,
          id,
          ...this.computeNutrition({
            sugar: drink?.sugar ?? 0,
            caffeine: drink?.caffeine ?? 0,
            coefficient: drink?.coefficient ?? 0,
            servingSize: drink?.servingSize ?? 1,
          }, deletedEntry.volume),

        }
      })
    },
  })
}

