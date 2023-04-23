import { roundNumber } from '../utils/roundNumber'
import { Drinks } from '../models/Drink.model'
import { MutationResolvers } from '../__generated__/graphql'
import { fromCursorHash, toCursorHash } from '../utils/cursorHash'
import { ModelType } from '../types/models'

export const mutationResolvers: MutationResolvers = {
  async entryCreate(_, { volume, drinkId }, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub
    const [,id] = fromCursorHash(drinkId).split(':')

    const {
      id: entryId,
      drink: {
        caffeine,
        sugar,
        coefficient,
      },
      ...entry
    } = await prisma.entry.create({
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
      ...entry,
    }
  },

  async drinkCreate(_, { drinkInput }, { prisma, req: { auth } }) {
    const drink = Drinks(prisma.drink)
    const userId = <string>auth?.sub

    const {
      caffeine,
      sugar,
      servingSize,
      ingredients,
      ...rest
    } = drinkInput

    if (ingredients) {
      return await drink.createWithIngredients(
        { userId, ...rest },
        ingredients,
        prisma,
      )
    }

    const nutrition = {
      caffeine: roundNumber(+(caffeine ?? 0) / +(servingSize ?? 1)),
      sugar: roundNumber(+(sugar ?? 0) / +(servingSize ?? 1)),
      coefficient: roundNumber(+(drinkInput.coefficient ?? 0)),
    }

    return await drink.create({ data: { ...rest, ...nutrition, userId }})
      .then(({ id, ...rest }) => ({
        id: toCursorHash(`BaseDrink:${id}`),
        ...rest,
      }))
  },

  async drinkDelete(_, { drinkId }, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub
    const [,id] = fromCursorHash(drinkId).split(':')
    const drink = Drinks(prisma.drink)

    console.log(userId, id)
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

  async drinkEdit(_, { drinkInput }, { prisma, req: { auth } }) {
    const userId = <string>auth?.sub

    if (!drinkInput.id) throw new Error('Drink ID required')

    const [type,id] = fromCursorHash(drinkInput.id).split(':') as [ModelType,string]

    const drink = Drinks(prisma.drink)
    if (!await drink.findUnique({ where: { id_userId: { id, userId } } })) throw new Error('drink not found')

    if (type !== 'MixedDrink') {
      console.log('is not mixed drink')
    } else {
      console.log('is mixed drink')
    }
    return null
  },
}
