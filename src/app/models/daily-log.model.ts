import { MealEntry } from "./meal-entry.model";

export interface DailyLog {
  date: string;                      // 'YYYY-MM-DD'
  meals: MealEntry[];
  totalCalories: number;
  weight?: number;                   // korisnik može unijeti novu težinu
}
