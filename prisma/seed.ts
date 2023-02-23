import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


async function main() {

  await prisma.drink.createMany({
    data: [
      {
        name: 'Water',
        icon: 'glass-water',
        caffeine: 0,
        coefficient: 1,
        sugar: 0,
      },
      {
        name: 'Coffee',
        icon: 'mug-saucer',
        caffeine: 12,
        coefficient: 0.7,
        sugar: 0,
      },
      {
        name: 'Tea',
        icon: 'mug-tea-saucer',
        caffeine: 5.875,
        coefficient: 0.8,
        sugar: 0,
      },
      {
        name: 'Orange Juice',
        icon: 'glass-citrus',
        coefficient: 0.55,
        sugar: 0.5,
        caffeine: 0,
      },
      {
        name: 'Milk',
        icon: 'jug',
        coefficient: 0.78,
        caffeine: 0,
        sugar: 1.5,
      },
      {
        name: 'Wine',
        icon: 'wine-glass',
        coefficient: -1.6,
        caffeine: 0,
        sugar: 0,
      },
      {
        name: 'Beer',
        icon: 'beer-mug',
        coefficient: -0.6,
        caffeine: 0,
        sugar: 0.3,
      },
      {
        name: 'Non Alcoholic Beer',
        icon: 'beer-mug',
        coefficient: 0.6,
        caffeine: 0,
        sugar: 2.375,
      },
      {
        name: 'Vodka',
        icon: 'martini-glass',
        coefficient: -3.5,
        caffeine: 0,
        sugar: 0,
      },
      {
        name: 'Mineral Water',
        icon: 'glass-water',
        coefficient: 0.93,
        caffeine: 0,
        sugar: 0,
      },
      {
        name: 'Milkshake',
        icon: 'blender',
        sugar: 4.9,
        coefficient: 0.5,
        caffeine: 0,
      },
      {
        name: 'Herbal Tea',
        icon: 'mug-tea-saucer',
        coefficient: 0.95,
        caffeine: 3,
        sugar: 0,
      },
      {
        name: 'Energy Drink',
        icon: 'can-food',
        sugar: 2.8,
        coefficient: 0.4,
        caffeine: 9,
      },
      {
        name: 'Hot Chocolate',
        icon: 'mug-marshmallows',
        sugar: 3,
        coefficient: 0.4,
        caffeine: 0.83,
      },
      {
        name: 'Coconut Water',
        icon: 'glass',
        sugar: 1,
        coefficient: 0.85,
        caffeine: 0,
      },
      {
        name: 'Lemonade',
        icon: 'glass',
        sugar: 3,
        coefficient: 0.8,
        caffeine: 0,
      },
    ],
  })

  const { id: sodaId } = await prisma.drink.create({
    data: {
      name: 'Soda',
      icon: 'cup-straw-swoosh',
      caffeine: 2.75,
      coefficient: 0.68,
      sugar: 3.25,
    },
  })
  const { id: whiskeyId } = await prisma.drink.create({
    data:
    {
      name: 'Whiskey',
      icon: 'whiskey-glass',
      coefficient: -3.5,
      caffeine: 0,
      sugar: 0.044,
    },
  })

  await prisma.user.createMany({
    data: [
      { id: 'auth0|633cb40c15422d538368f4c6' },
      { id: 'auth0|6341da849ae95d74a374a5e1' },
    ],
  })

  await prisma.drink.create({
    data: {
      name: 'Seven & Seven',
      icon: 'whiskey-glass-ice',
      userId: 'auth0|633cb40c15422d538368f4c6',
      ingredients: {
        create: [{
          drinkId: sodaId,
          parts: 4,
        }, {
          drinkId: whiskeyId,
          parts: 1,
        }],
      },
    },
  })
}


main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {

    console.error(e)

    await prisma.$disconnect()

    process.exit(1)

  })
