import { Drink, Entry } from '@prisma/client'

export interface ResolvedEntry extends Entry {
  id: string;
  servings: number;
}

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


export type ModelType = 'User' | 'MixedDrink' | 'BaseDrink' | 'Entry' | 'DrinkHistory'

export type DrinkHistory = {
  id: string,
  drink: Drink,
  count: number,
  totalVolume: number,
  waterVolume: number,
}
