export interface UserProfile {
  user_id: string;
  gender: 'male' | 'female' | '';
  age: number;
  height: number; // cm
  weight: number; // kg
  activity_level: 'low' | 'moderate' | 'high' | '';
  goal: 'maintain' | 'gain' | 'lose' | '';
  calorie_target: number;
  protein_target: number;
  carb_target: number;
  fat_target: number;
  created_at: string; // ISO string
  photo_url?: string;
}
