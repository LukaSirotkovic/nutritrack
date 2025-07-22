import { MealEntry } from "./meal-entry.model";

export interface DailyLog {
  date: string;                 
  meals: MealEntry[];
  totalDailyCalories: number;
  totalDailyProteins?: number;
  totalDailyCarbs?: number;
  totalDailyFats?: number;
  weight?: number;
}
