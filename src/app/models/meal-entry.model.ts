import { FoodItem } from "./food-item.model";

export interface MealEntry {
  id?: string;                       // Firestore ID
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: string;                // ISO format
  items: FoodItem[];                // popis unesenih namirnica
  totalCalories: number;           // izračunato iz `items`
}
