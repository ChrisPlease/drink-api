import { fetch } from 'undici'
import { ScanDrink } from '@/graphql/src/types/models'
import {
  NutritionixResponse,
  NutritionixItem,
} from '@/graphql/src/types/nutritionix'
import { toCursorHash } from '@/graphql/src/utils/cursorHash'

async function baseFetch(path: string, params: Record<string, string>): Promise<NutritionixResponse> {
  const headers = new Headers()
  const queryParams = new URLSearchParams(params)
  headers.set('x-app-id', process.env.NUTRITIONIX_APP_ID)
  headers.set('x-app-key', process.env.NUTRITIONIX_API_KEY)

  const res = await fetch(`${process.env.NUTRITIONIX_API}/v2/${path}?${queryParams.toString()}`, {
    headers,
  })

  return await res.json() as NutritionixResponse
}

export async function fetchItem(params: { upc: string }) {
  const res = await baseFetch('search/item', params)
  const { foods } = res
  const item = foods?.[0]

  return mapNutritionixToDrinkNutrition(item, params.upc)
}

function mapNutritionixToDrinkNutrition(item: NutritionixItem, upc: string): ScanDrink {
  return {
    id: toCursorHash(`ScanDrink:${upc}`),
    name: `${item.brand_name} ${item.food_name}`,
    upc,
    nutrition: {
      servingSize: item.serving_qty || 8,
      servingUnit: item.serving_unit || 'fl oz',
      metricSize: item.nf_metric_qty,

      calories: item.nf_calories,

      totalFat: item.nf_total_fat,
      saturatedFat: item.nf_saturated_fat,
      sodium: item.nf_sodium,
      carbohydrates: item.nf_total_carbohydrate,

      sugar: item.nf_sugars,
      addedSugar: item.nf_sugars,

      protein: item.nf_protein,
      potassium: item.nf_potassium,
    },
  }
}

