export interface UserProfile {
  uid: string; // Firebase UID
  gender: 'male' | 'female' | '';
  age: number;
  height: number; // u centimetrima
  weight: number; // u kilogramima
  activityLevel: 'low' | 'moderate' | 'high' | '';
  goal: 'maintain' | 'gain' | 'lose' | '';
  calorieTarget: number; // izračunati TDEE
  createdAt: string; // ISO string datuma
  proteinTarget: number; // 1.8g/kg
  carbTarget: number; // 4g/kg
  fatTarget: number; // 1g/kg
}
