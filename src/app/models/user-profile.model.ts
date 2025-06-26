export interface UserProfile {
  uid: string;               // Firebase UID
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;            // u centimetrima
  weight: number;            // u kilogramima
  activityLevel: 'low' | 'moderate' | 'high';
  goal: 'maintain' | 'gain' | 'lose';
  calorieTarget: number;     // izračunati TDEE
  createdAt: string;         // ISO string datuma
}
