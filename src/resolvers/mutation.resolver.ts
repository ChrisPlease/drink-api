import { roundNumber } from '../utils/roundNumber'
import { Drinks } from '../models/Drink.model'
import { MutationResolvers } from '../__generated__/graphql'
import { fromCursorHash, toCursorHash } from '../utils/cursorHash'
import { ModelType } from '../types/models'
import { Entries } from '../models/Entry.model'
import { Entry } from '@prisma/client'

export const mutationResolvers: MutationResolvers = {
  async entryCreate(_, { volume, drinkId }, { prisma, req: { auth } }) {
    const entry = Entries(prisma.entry)
    const userId = <string>auth?.sub
    const [,id] = fromCursorHash(drinkId).split(':')

    const {
      id: entryId,
      drink: {
        caffeine,
        sugar,
        coefficient,
      },
      ...rest
    } = await entry.create({
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
          },
        },
      },
    })

    const nutrition = {
      sugar: roundNumber((sugar ?? 0) * volume),
      waterContent: roundNumber((coefficient ?? 0) * volume),
      caffeine: roundNumber((caffeine ?? 0) * volume),
    }

    return {
      id: toCursorHash(`Entry:${entryId}`),
      ...nutrition,
      ...rest,
    }
  },

  async entryDelete(_, { entryId }, { prisma, req: { auth } }) {
    const entry = Entries(prisma.entry)
    const userId = <string>auth?.sub
    const [,id] = fromCursorHash(entryId).split(':')

    return await entry.delete({
      where: {
        id,
        userId,
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }).then(({ id, ...rest }) => ({ id: entryId, ...rest })) as Entry
  },

  async drinkCreate(_, { drinkInput }, { prisma, req: { auth } }) {
    const drink = Drinks(prisma.drink)
    const userId = <string>auth?.sub

    const {
      ingredients,
      caffeine,
      servingSize,
      sugar,
      coefficient,
      ...rest
    } = drinkInput

    const nutrition = { caffeine, servingSize, sugar, coefficient }

    if (ingredients) {
      return await drink.createWithIngredients(
        { userId, ingredients, ...rest },
        prisma,
      )
    }

    return await drink.createWithNutrition({ userId, ...nutrition, ...rest })
  },

  async drinkDelete(_, { drinkId }, { prisma, req: { auth } }) {
    const drink = Drinks(prisma.drink)
    const userId = <string>auth?.sub
    const [,id] = fromCursorHash(drinkId).split(':')

    return await drink
      .delete({
        where: {
          id_userId: {
            id,
            userId,
          },
        },
      })
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      .then(({ id, ...rest }) => ({
        id: drinkId,
        ...rest,
      }))
  },

  async drinkEdit(
    _,
    {
      drinkInput: {
        caffeine,
        sugar,
        servingSize,
        coefficient,
        ingredients,
        ...drinkInput
      },
    }, { prisma, req: { auth } }) {
    const hasNutrition = !!caffeine || !!sugar || !!servingSize || !!coefficient
    const drink = Drinks(prisma.drink)
    const userId = <string>auth?.sub
    const [type,id] = fromCursorHash(drinkInput.id).split(':') as [ModelType,string]

    if (!drinkInput.id) throw new Error('Drink ID required')

    await drink.findUniqueOrThrow({ where: { id, userId } })

    if (type === 'MixedDrink') {
      if (hasNutrition) throw new Error('Cannot add nutrition to a Base Drink')
      if (ingredients) {
        return await drink.updateWithIngredients(
          { userId, ingredients, ...drinkInput },
          prisma,
        )
      } else {
        return await drink.update({
          where: { id, userId },
          data: { userId, ...drinkInput },
        })
      }
    } else {
      if (ingredients) throw new Error('Cannot add ingredients to a Base Drink')
      const nutrition = { caffeine, sugar, coefficient }

      if (Object.values(nutrition).some(item => item) && !servingSize) {
        throw new Error('Serving size is required when editing nutritional values')
      }

      return await drink.updateWithNutrition({
        userId,
        servingSize,
        ...nutrition,
        ...drinkInput,
      })
    }
  },
}
