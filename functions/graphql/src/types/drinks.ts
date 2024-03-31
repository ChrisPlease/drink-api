import { Prisma } from '@prisma/client'

export type DrinkWithIngredientCountPayload = Prisma.DrinkGetPayload<{
  include: {
    _count: {
      select: {
        ingredients: boolean,
      },
    },
  },
}>
