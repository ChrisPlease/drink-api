import { PrismaClient } from '@prisma/client'
import { seedUsers } from './seeders/users'
import { seedDrinks } from './seeders/drinks'
import { seedEntries } from './seeders/entries'

const prisma = new PrismaClient()

async function main() {

  const [
    { id: userId1 },
    { id: userId2 },
  ] = await seedUsers(prisma, [
    'auth0|633cb40c15422d538368f4c6',
    'auth0|6341da849ae95d74a374a5e1',
  ])
  const {
    water: waterId,
    soda: sodaId,
    whiskey: whiskeyId,
    coffee: coffeeId,
  } = await seedDrinks(prisma)

  const { id } = await prisma.drink.create({
    data: {
      name: 'Seven & Seven',
      icon: 'whiskey-glass-ice',
      userId: userId1,
      servingSize: 12,
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

  type NutritionQuery = {
    caffeine: string,
    sugar: string,
    coefficient: string,
  }

  const [{
    sugar,
    caffeine,
    coefficient,
  }] = await prisma.$queryRaw<NutritionQuery[]>`
  SELECT
    ROUND(SUM((i.parts::float/t.parts)*d.coefficient)::numeric, 2) AS coefficient,
    ROUND(SUM(((d2.serving_size*(i.parts::float/t.parts))/d.serving_size)*d.caffeine)::numeric, 2) AS caffeine,
    ROUND(SUM(((d2.serving_size*(i.parts::float/t.parts))/d.serving_size)*d.sugar)::numeric, 2) AS sugar
  FROM drink_ingredients di
  INNER JOIN ingredients i ON di.ingredient_id = i.id
  INNER JOIN drinks d ON i.drink_id = d.id
  INNER JOIN drinks d2 ON d2.id = di.drink_id
  INNER JOIN (
    SELECT
      di.drink_id AS drink_id,
      SUM(i.parts) AS parts
    FROM ingredients i
    INNER JOIN drink_ingredients di ON di.ingredient_id = i.id GROUP BY di.drink_id
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
    { drinkId: sodaId, userId: userId1, volume: 12 },
    { drinkId: sodaId, userId: userId1, volume: 12 },
    { drinkId: whiskeyId, userId: userId1, volume: 1.5 },
    { drinkId: whiskeyId, userId: userId1, volume: 1.5 },
    { drinkId: id, userId: userId1, volume: 8 },
    { drinkId: id, userId: userId1, volume: 8 },

    { drinkId: waterId, userId: userId2, volume: 28 },
    { drinkId: waterId, userId: userId2, volume: 32 },
    { drinkId: coffeeId, userId: userId2, volume: 12 },
    { drinkId: sodaId, userId: userId2, volume: 16 },
    { drinkId: whiskeyId, userId: userId2, volume: 1.5 },
  ]

  await seedEntries(prisma, entryData)
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
