type Unit = 'g' | 'ml' | 'pcs';

export interface FoodItem {
  food_id: string;
  name: string;
  default_quantity: number;
  unit: Unit;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}
