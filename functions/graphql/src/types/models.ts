import { Drink, Entry } from '@prisma/client'
import { DrinkNutrition, DrinkServingSize } from '@/__generated__/graphql'

export interface ScanDrink extends Omit<DrinkResult, 'userId' | 'deleted' | 'icon' | 'createdAt'> {
  icon?: string | null;
}

export interface DrinkResult extends Drink {
  nutrition?: DrinkNutrition | null;
  serving: DrinkServingSize;
}

export interface ResolvedEntry extends Entry {
  id: string;
  servings?: number;
}

export type NutritionResult = {
  coefficient?: number,

  calories?: number,

  saturatedFat?: number,
  totalFat?: number,

  cholesterol?: number,
  sodium?: number,
  carbohydrates?: number,
  fiber?: number,
  sugar?: number,
  addedSugar?: number,
  protein?: number,
  potassium?: number,

  caffeine: number,
}

export type NutritionQuery = {
  coefficient: string,

  calories: string,

  saturated_fat: string,
  total_fat: string,
  cholesterol: string,
  sodium: string,
  carbohydrates: string,
  fiber: string,
  sugar: string,
  added_sugar: string,
  protein: string,
  potassium: string,

  caffeine: string,
}


export type ModelType = 'User' | 'MixedDrink' | 'BaseDrink' | 'Entry' | 'DrinkHistory'

export type DrinkHistory = {
  id: string,
  drink?: Drink,
  count?: number,
  volume?: number,
  water?: number,
}
