import { fetch } from 'undici'

interface NutritionixPhoto {
  thumb: string | null;
  highres: string | null;
  is_user_uploaded: boolean;
}

interface NutritionixNutrition {
  attr_id: number;
  value: number;
}

interface NutritionixItem {
  food_name: string | null;
  brand_name: string | null;
  serving_qty: number | null;
  serving_unit: string | null;
  serving_weight_grams: number | null;

  nf_metric_qty: number | null;
  nf_metric_uom: string | null;

  nf_calories: number | null;
  nf_total_fat: number | null;

  nf_saturated_fat: number | null;
  nf_cholesterol: number | null;
  nf_sodium: number | null;
  nf_total_carbohydrate: number | null;
  nf_dietary_fiber: number | null;
  nf_sugars: number | null;
  nf_protein: number | null;
  nf_potassium: number | null;
  nf_p: number | null;

  full_nutrients: NutritionixNutrition[];

  nix_brand_name: string;
  nix_brand_id: string;
  nix_item_name: string;
  nix_item_id: string;

  metadata: Record<string, unknown>;
  source: number | null;
  ndb_no: number | null;

  tags: null;
  alt_measures: null;
  lat: null;
  lng: null;

  photo: NutritionixPhoto;

  note: null;
  class_code: null;
  brick_code: null;
  tag_id: null;
  updated_at: string;

  nf_ingredient_statement: string | null;
}

interface NutritionixResponse {
  foods: NutritionixItem[];
}

async function baseFetch(path: string, params: Record<string, string>): Promise<NutritionixResponse> {
  const headers = new Headers()
  const queryParams = new URLSearchParams(params)
  headers.set('x-app-id', process.env.NUTRITIONIX_APP_ID || '')
  headers.set('x-app-key', process.env.NUTRITIONIX_API_KEY || '')

  const res = await fetch(`${process.env.NUTRITIONIX_API}/v2/${path}?${queryParams.toString()}`, {
    headers,
  })

  return await res.json() as NutritionixResponse
}

export async function fetchItem(params: { upc: string }) {
  const res = await baseFetch('search/item', params)
  const { foods } = res
  const item = foods?.[0]

  console.log(res)

  return {
    name: `${item.brand_name} ${item.food_name}`,
    upc: params.upc,
    nutrition: {
      sugar: item.nf_sugars,
    },
  }
}

