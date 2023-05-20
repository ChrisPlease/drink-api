import { Drinks } from '@/models/Drink.model'
import { Entries } from '@/models/Entry.model'
import { MutationResolvers } from '@/__generated__/graphql'
import { deconstructId, toCursorHash } from '@/utils/cursorHash'

export const mutationResolvers: MutationResolvers = {
  async entryCreate(_, { volume, drinkId }, { prisma, req: { auth } }) {
    const entry = Entries(prisma.entry)
    const userId = <string>auth?.sub
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
            servingSize: true,
          },
        },
      },
    })

    const nutrition = entry.computeNutrition({
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

  async entryDelete(_, { entryId }, { prisma, req: { auth } }) {
    const entry = Entries(prisma.entry)
    const userId = <string>auth?.sub
    const [,id] = deconstructId(entryId)

    return await prisma.$transaction(async (tx) => {
      const { drinkId, ...deletedEntry } = await tx.entry.delete({
        where: { id, userId },
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
        ...entry.computeNutrition({
          sugar: drink?.sugar ?? 0,
          caffeine: drink?.caffeine ?? 0,
          coefficient: drink?.coefficient ?? 0,
          servingSize: drink?.servingSize ?? 1,
        }, deletedEntry.volume),

      }
    })
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
        { userId, servingSize, ingredients, ...rest },
        prisma,
      )
    }

    return await drink.createWithNutrition({ userId, ...nutrition, ...rest })
  },

  async drinkDelete(_, { drinkId }, { prisma, req: { auth } }) {
    const drink = Drinks(prisma.drink)
    const userId = <string>auth?.sub
    const [,id] = deconstructId(drinkId)

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
    const [type,id] = deconstructId(drinkInput.id)

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

  async userCreate(_, { userId }, { prisma }) {
    try {
      return await prisma.user.create({ data: { id: userId } })
    } catch (err) {
      throw new Error('User already exists')
    }
  },
}
