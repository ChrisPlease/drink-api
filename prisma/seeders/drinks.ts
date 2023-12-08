import { Prisma, PrismaClient } from '@prisma/client'
import { v5 as uuidv5 } from 'uuid'
import { namespaceUuid } from '../constants'

export async function seedDrinks(prisma: PrismaClient, drinks?: Prisma.DrinkCreateInput[]) {
  const drinksArray: Prisma.DrinkCreateInput[] = [
    {
      name: 'Water',
      icon: 'glass-water',
      nutrition: {
        create: {
          servingSize: 8,
          servingUnit: 'fl oz',
          metricSize: 230,
          imperialSize: 8,
        },
      },
    },
    {
      name: 'Drip Coffee',
      icon: 'mug-saucer',
      nutrition: {
        create: {
          coefficient: 92,
          servingSize: 6,
          servingUnit: 'fl oz',
          metricSize: 170,
          imperialSize: 6,
          protein: 0.3,
        },
      },
    },
    {
      name: 'Whiskey',
      icon: 'whiskey-glass',
      nutrition: {
        create: {
          coefficient: -400,
          servingSize: 1.5,
          servingUnit: 'fl oz',
          metricSize: 45,
          imperialSize: 1.5,
          calories: 100,
        },
      },
    },
    ...(drinks?.length ? drinks : []),
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
    (acc, { id, name }) => ({ [name.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase(),
  ).replace(/\s+/g, '')]: id, ...acc }), {} as Record<string, string>,
  ))
}
