import { EntryNutrition, EntryResolvers } from '@/__generated__/graphql'
import { Entries } from '@/models/Entry.model'
import { ozToMl } from '@/utils/unit-conversions'

export const entryResolvers: EntryResolvers = {
  async drink({ id }, _, { prisma }) {
    return await Entries(prisma.entry).findDrinkByEntryId(id)
  },

  async nutrition({ drinkId, volume }, _, { prisma }) {
    const { metricSize } = await prisma.drink.findUnique({
      where: {
        id: drinkId,
      },
      select: {
        metricSize: true,
      },
    }) ?? {}
    const {
      coefficient,
      drinkId: __,
      ...drinkNutrition
    } = await prisma.nutrition.findUnique({ where: { drinkId } }) ?? {}

    const metricVolume = Math.ceil(ozToMl(volume))
    const portion = Math.round((metricVolume / (metricSize || 1)) * 8) / 8

    return Object.entries(drinkNutrition).reduce((acc, [key, node]) => ({
      [key]: typeof node === 'number' ? node * portion : 0,
      ...acc,
    }), {
      water: (Math.round((coefficient || 1) * 10) / 1000) * volume,
    } as EntryNutrition)
  },

  async user({ id }, _, { prisma }) {
    return await Entries(prisma.entry).findUserByEntryId(id)
  },
}
