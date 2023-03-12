import { Prisma, PrismaClient } from '@prisma/client'
import { roundNumber } from '../utils/roundNumber'
import { Entry } from '../__generated__/graphql'

type Nutrition = {
  caffeine: number,
  waterContent: number,
  sugar: number,
}

interface RawEntry {
  caffeine: number;
  volume: number;
  id: string;
  waterContent: number;
  sugar: number;
  timestamp: Date;
  drink_id: string;
  user_id: string;

}

export function Entries(prismaEntry: PrismaClient['entry']) {

  return Object.assign(prismaEntry, {
    async findWithNutrition(
      args: Prisma.EntryFindManyArgs): Promise<Entry[]> {
      const entries = await prismaEntry.findMany({
        ...args,
        include: {
          drink: {
            select: {
              caffeine: true,
              sugar: true,
              coefficient: true,
            },
          },
        },
      })

      return entries.map(({ drink, ...entry }) => {
        const nutrition: Nutrition = {
          caffeine: roundNumber((drink?.caffeine ?? 0) * entry.volume),
          sugar: roundNumber((drink?.sugar ?? 0) * entry.volume),
          waterContent: roundNumber((drink?.coefficient ?? 0) * entry.volume),
        }

        return {
          ...nutrition,
          ...entry,
        }
      })
    },

    async findAndCountDistinct(
      client: PrismaClient,
      userId: string,
      drinkId?: string,
      limit?: number,
      cursor?: string,
    ): Promise<{ count: number; entries: RawEntry[] }> {

      const rawEntries = await client.$queryRaw<RawEntry[]>`
            WITH cte AS (
        SELECT ROW_NUMBER() OVER (ORDER BY timestamp DESC) row_idx,
          *
        FROM (
            SELECT
              DISTINCT ON (volume)
              *
            FROM entries WHERE user_id = ${userId} ${
              drinkId ? Prisma.sql`AND drink_id = ${drinkId}::uuid` : Prisma.empty
            } ORDER BY volume,timestamp DESC
          ) e ORDER BY timestamp DESC
        )

        SELECT
          c.id,
          c.volume,
          ROUND((d.sugar*c.volume)::numeric, 2) sugar,
          ROUND((d.coefficient*c.volume)::numeric,2) "waterContent",
          ROUND((d.caffeine*c.volume)::numeric,2) caffeine,
          c.timestamp,
          c.drink_id,
          c.user_id
        FROM cte c
        LEFT JOIN drinks d ON d.id = c.drink_id
        ${
          cursor
            ? Prisma.sql`INNER JOIN cte c2 ON c2.id = ${cursor}::uuid AND c.row_idx > c2.row_idx`
            : Prisma.empty
        }
        ORDER BY c.row_idx
        `

        return {
          count: rawEntries.length,
          entries: limit ? rawEntries.slice(0, limit) : rawEntries,
        }
    },
  })
}

