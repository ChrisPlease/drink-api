import { Drink } from '@prisma/client'

export type Nutrition = {
  caffeine: number,
  sugar: number,
  coefficient: number,
}

export type NutritionQuery = {
  caffeine: string,
  sugar: string,
  coefficient: string,
}


export type ModelType = 'MixedDrink' | 'BaseDrink' | 'Entry' | 'DrinkHistory'

export type DrinkHistory = {
  id: string,
  drink: Drink,
  count: number,
  totalVolume: number,
  waterVolume: number,
  lastEntry: Date | null,
}
