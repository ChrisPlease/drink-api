import { Seeder } from '@jorgebodega/typeorm-seeding'
import { DataSource } from 'typeorm'
import { Drink } from '../entities/Drink.entity'

export default class DrinksSeeder extends Seeder {
  async run(dataSource: DataSource) {
    const drinks = Drink.create([
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
        caffeine: 32,
        coefficient: 0.7,
        sugar: 0,
      },
      {
        name: 'Tea',
        icon: 'mug-tea-saucer',
        caffeine: 12,
        coefficient: 0.8,
        sugar: 0,
      },
      {
        name: 'Soda',
        icon: 'can-food',
        caffeine: 32,
        coefficient: 0.68,
        sugar: 12,
      },
      {
        name: 'Soda',
        icon: 'cup-straw-swoosh',
        caffeine: 32,
        coefficient: 0.68,
        sugar: 12,
      },
      {
        name: 'Smoothie',
        icon: 'blender',
        coefficient: 0.33,
        sugar: 23,
        caffeine: 0,
      },
      {
        name: 'Yogurt',
        icon: 'bowl-soft-serve',
        coefficient: 0.5,
        sugar: 45,
        caffeine: 0,
      },
      {
        name: 'Juice',
        icon: 'glass',
        coefficient: 0.55,
        sugar: 30,
        caffeine: 0,
      },
      {
        name: 'Milk',
        icon: 'jug',
        coefficient: 0.78,
        caffeine: 0,
        sugar: 12,
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
        sugar: 12,
      },
      {
        name: 'Non Alcoholic Beer',
        icon: 'beer-mug',
        coefficient: 0.6,
        caffeine: 0,
        sugar: 10,
      },
      {
        name: 'Whiskey',
        icon: 'whiskey-glass',
        coefficient: -3.5,
        caffeine: 0,
        sugar: 0,
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
        sugar: 40,
        coefficient: 0.5,
        caffeine: 0,
      },
      {
        name: 'Herbal Tea',
        icon: 'mug-tea-saucer',
        coefficient: 0.95,
        caffeine: 12,
        sugar: 0,
      },
      {
        name: 'Energy Drink',
        icon: 'can-food',
        sugar: 80,
        coefficient: 0.4,
        caffeine: 34,
      },
      {
        name: 'Cacao',
        icon: 'mug-saucer',
        sugar: 60,
        coefficient: 0.65,
        caffeine: 3,
      },
      {
        name: 'Hot Chocolate',
        icon: 'mug-marshmallows',
        sugar: 60,
        coefficient: 0.4,
        caffeine: 22,
      },
      {
        name: 'Coconut Water',
        icon: 'glass',
        sugar: 15,
        coefficient: 0.85,
        caffeine: 0,
      },
      {
        name: 'Lemonade',
        icon: 'glass',
        sugar: 23,
        coefficient: 0.8,
        caffeine: 0,
      },
    ])

    await dataSource.createEntityManager().save<Drink>(drinks)
  }
}
