export interface FoodItem {
  food_id: string;
  name: string;
  default_quantity: number;
  unit: 'g' | 'ml' | 'pcs';
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}
