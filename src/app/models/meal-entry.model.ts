import { FoodItem } from './food-item.model';

export interface MealEntry {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'branch' | string;
  timestamp: string;
  items: FoodItem[];
  totalMealCalories?: number;
  totalMealProteins?: number;
  totalMealCarbs?: number;
  totalMealFats?: number;
}
