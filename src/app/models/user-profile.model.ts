export interface UserProfile {
	uid: string;

	gender: 'male' | 'female' | '';
	dateOfBirth: string; // ISO string "YYYY-MM-DD" ili možeš koristiti Timestamp u bazi
	height: number; // cm
	weight: number; // kg
	activity_level: 'low' | 'moderate' | 'high' | '';
	goal: 'maintain' | 'gain' | 'lose' | '';

	calorie_target: number;
	protein_target: number;
	carb_target: number;
	fat_target: number;

	created_at: string; // ISO string ako ćeš serijalizirati → u bazi drži serverTimestamp()
	photo_url?: string;
	displayName?: string;
	email?: string;
}
