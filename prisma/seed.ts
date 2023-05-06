import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


async function main() {
  const userId = 'auth0|633cb40c15422d538368f4c6'
  const userId2 = 'auth0|6341da849ae95d74a374a5e1'

  const { id: waterId } = await delay(5000).then(async () => await prisma.drink.create({
    data: {
      name: 'Water',
      icon: 'glass-water',
      caffeine: 0,
      coefficient: 1,
      sugar: 0,
    },
  }))

  await delay(5000)

  const { id: coffeeId } = await prisma.drink.create({
    data: {
      name: 'Coffee',
      icon: 'mug-saucer',
      caffeine: 12,
      coefficient: 0.7,
      sugar: 0,
    },
  })

  await delay(5000)

  const drinks = [
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
  ]

  for (let i = 0; i < drinks.length; i++) {
    await delay(5000).then(async () => {
      await prisma.drink.create({ data: drinks[i] })
    })
  }

  await delay(5000)

  const { id: sodaId } = await prisma.drink.create({
    data: {
      name: 'Soda',
      icon: 'cup-straw-swoosh',
      caffeine: 2.75,
      coefficient: 0.68,
      sugar: 3.25,
    },
  })

  await delay(5000)

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

  await delay(5000)

  await prisma.user.createMany({
    data: [
      { id: userId },
      { id: userId2 },
    ],
  })

  await delay(5000)

  const { id } = await prisma.drink.create({
    data: {
      name: 'Seven & Seven',
      icon: 'whiskey-glass-ice',
      userId: userId,
      ingredients: {
        create:
          [
            { drinkId: sodaId, parts: 4 },
            { drinkId: whiskeyId, parts: 1 },
          ].map(ingredient => ({
            ingredient: { create: ingredient },
          })),
      },
    },
  })

  const [{ sugar, caffeine, coefficient }] = await prisma.$queryRaw<{ caffeine: string; sugar: string; coefficient: string }[]>`
  SELECT
    ROUND(SUM((i.parts::float/t.parts)*d.coefficient)::numeric, 2) AS coefficient,
    ROUND(SUM((i.parts::float/t.parts)*d.caffeine)::numeric, 2) AS caffeine,
    ROUND(SUM((i.parts::float/t.parts)*d.sugar)::numeric, 2) AS sugar
  FROM drink_ingredients di
  INNER JOIN ingredients i ON di.ingredient_id = i.id
  INNER JOIN drinks d ON i.drink_id = d.id
  INNER JOIN (
    SELECT di.drink_id AS drink_id,	SUM(i.parts) AS parts FROM ingredients i INNER JOIN drink_ingredients di ON di.ingredient_id = i.id GROUP BY di.drink_id
  ) t ON t.drink_id = di.drink_id
  WHERE di.drink_id = ${id}::uuid`

  await prisma.drink.update({
    where: { id },
    data: {
      caffeine: +caffeine,
      sugar: +sugar,
      coefficient: +coefficient,
    },
  })

  const entryData = [
    { drinkId: sodaId, userId, volume: 12 },
    { drinkId: sodaId, userId, volume: 12 },
    { drinkId: whiskeyId, userId, volume: 1.5 },
    { drinkId: whiskeyId, userId, volume: 1.5 },

    { drinkId: waterId, userId: userId2, volume: 28 },
    { drinkId: waterId, userId: userId2, volume: 32 },
    { drinkId: coffeeId, userId: userId2, volume: 12 },
  ]

  for (let i = 0; i < entryData.length; i++) {

    await delay(5000)
    await prisma.entry.create({ data: {...entryData[i], timestamp: new Date() } })
  }
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
