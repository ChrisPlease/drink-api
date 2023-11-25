import { PrismaClient } from '@prisma/client'
import { v5 as uuidv5 } from 'uuid'
import { namespaceUuid } from '../constants'

export async function seedDrinks(prisma: PrismaClient) {
  const drinksArray = [
    {
      name: 'Water',
      icon: 'glass-water',
    },
  ]

  return await Promise.all(drinksArray.map(async (drink, index) => {
    return await prisma.drink.create({
      data: {
        id: uuidv5(drink.name, namespaceUuid),
        ...drink,
        createdAt: new Date(2023, 0, 0, 0, index, 0),
      },
    })
  }))
  .then(res => res.reduce(
    (acc, { id, name }) => ({ [name.toLowerCase().replace(/\s/, '-')]: id, ...acc }), {} as Record<string, string>,
  ))
}
