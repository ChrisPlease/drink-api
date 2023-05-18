import { PrismaClient } from '@prisma/client'
import { v5 as uuidv5 } from 'uuid'
import { namespaceUuid } from '../constants'

export async function seedDrinks(prisma: PrismaClient) {
  const drinksArray = [
    {
      name: 'Water',
      icon: 'glass-water',
      caffeine: 0,
      coefficient: 1,
      servingSize: 8,
      sugar: 0,
    }, {
      name: 'Soda',
      icon: 'cup-straw-swoosh',
      caffeine: 21,
      coefficient: 0.68,
      servingSize: 8,
      sugar: 32,
    }, {
      name: 'Whiskey',
      icon: 'whiskey-glass',
      coefficient: -3.5,
      caffeine: 0,
      servingSize: 1.5,
      sugar: 0.044,
    }, {
      name: 'Coffee',
      icon: 'mug-saucer',
      caffeine: 12,
      coefficient: 0.7,
      servingSize: 8,
      sugar: 0,
    }, {
      name: 'Tea',
      icon: 'mug-tea-saucer',
      caffeine: 5.875,
      coefficient: 0.8,
      servingSize: 8,
      sugar: 0,
    }, {
      name: 'Orange Juice',
      icon: 'glass-citrus',
      coefficient: 0.55,
      sugar: 0.5,
      servingSize: 8,
      caffeine: 0,
    }, {
      name: 'Whole Milk',
      icon: 'jug',
      servingSize: 8,
      coefficient: 0.78,
      caffeine: 0,
      sugar: 12.83,
    }, {
      name: 'Red Wine',
      icon: 'wine-glass',
      coefficient: -1.6,
      caffeine: 0,
      servingSize: 5,
      sugar: 0.91,
    }, {
      name: 'Beer',
      icon: 'beer-mug',
      coefficient: -0.6,
      caffeine: 0,
      servingSize: 12,
      sugar: 0,
    }, {
      name: 'Non Alcoholic Beer',
      icon: 'beer-mug',
      servingSize: 12,
      caffeine: 0,
      sugar: 0,
      coefficient: 0.6,
    }, {
      name: 'Vodka',
      icon: 'martini-glass',
      servingSize: 1.5,
      coefficient: -3.5,
      caffeine: 0,
      sugar: 0,
    }, {
      name: 'Mineral Water',
      icon: 'glass-water',
      servingSize: 8,
      coefficient: 0.93,
      caffeine: 0,
      sugar: 0,
    }, {
      name: 'Milkshake',
      icon: 'blender',
      servingSize: 10,
      sugar: 49.01,
      coefficient: 0.5,
      caffeine: 0,
    }, {
      name: 'Herbal Tea',
      icon: 'mug-tea-saucer',
      servingSize: 8,
      coefficient: 0.95,
      caffeine: 3,
      sugar: 0,
    }, {
      name: 'Energy Drink',
      icon: 'can-food',
      servingSize: 8,
      sugar: 24.1,
      coefficient: 0.4,
      caffeine: 9,
    }, {
      name: 'Hot Chocolate',
      icon: 'mug-marshmallows',
      servingSize: 8,
      sugar: 27.4,
      coefficient: 0.4,
      caffeine: 0.83,
    }, {
      name: 'Coconut Water',
      icon: 'glass',
      servingSize: 8,
      sugar: 6.26,
      coefficient: 0.85,
      caffeine: 0,
    }, {
      name: 'Lemonade',
      icon: 'glass',
      servingSize: 8,
      sugar: 24.73,
      coefficient: 0.8,
      caffeine: 0,
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
    (acc, { id, name }) => ({ [name]: id, ...acc }), {} as Record<string, string>,
  ))
}
