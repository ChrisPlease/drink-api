import { Drink } from '@prisma/client'

export type Nutrition = {
  caffeine: number,
  sugar: number,
  coefficient: number,
  servingSize: number,
}

export type NutritionQuery = {
  caffeine: string,
  sugar: string,
  coefficient: string,
}


export type ModelType = 'User' | 'MixedDrink' | 'BaseDrink' | 'Entry' | 'DrinkHistory'

export type DrinkHistory = {
  id: string,
  drink: Drink | string,
  count: number,
  totalVolume: number,
  waterVolume: number,
}
