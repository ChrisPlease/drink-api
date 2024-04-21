import { Handler } from 'aws-lambda'
import { fetch as undiciFetch, Headers } from 'undici'
import * as dotEnv from 'dotenv'
import { ApiError, Logger } from '@waterlog/utils'
import {
  NutritionixResponse,
  NutritionixItem,
} from '@/types/nutritionix'


dotEnv.config()

interface CustomEvent {
  upc: string;
}

export const handler: Handler<CustomEvent> = async ({ upc }) => {
  const res = await fetchItem({ upc })

  return res
}


async function baseFetch(path: string, params: Record<string, string>): Promise<NutritionixResponse | undefined> {
  const headers: Headers = new Headers()
  const queryParams = new URLSearchParams(params)
  headers.set('x-app-id', process.env.NUTRITIONIX_APP_ID)
  headers.set('x-app-key', process.env.NUTRITIONIX_API_KEY)

  const res = await undiciFetch(`${process.env.NUTRITIONIX_API}/v2/${path}?${queryParams.toString()}`, {
    headers,
  })

  if (res.ok) {
    return await res.json() as NutritionixResponse
  } else {
    throw new ApiError(res.status)
  }


}

async function fetchItem<T>(params: { upc: string }): Promise<T | undefined> {
  try {

    const res = await baseFetch('search/item', params)

    console.log('RES', res)
    const item = res?.foods?.[0]

    if (item)
      return mapNutritionixToDrinkNutrition(item, params.upc) as T

  } catch (err: any) {
    Logger.error(err)
    throw new ApiError(err.status)
  }
}

function mapNutritionixToDrinkNutrition(item: NutritionixItem, upc: string) {
  return {
    name: `${item.brand_name} ${item.food_name}`,
    upc,
    serving: {
      servingSize: item.serving_qty || 8,
      servingUnit: item.serving_unit || 'fl oz',
      metricSize: item.nf_metric_qty,
    },
    nutrition: {
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

