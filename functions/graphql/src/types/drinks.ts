import { Prisma } from '/opt/nodejs/node_modules/.prisma/client'

export type DrinkWithIngredientCountPayload = Prisma.DrinkGetPayload<{
  include: {
    _count: {
      select: {
        ingredients: boolean,
      },
    },
  },
}>
