// daily-log.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit } from '@angular/fire/firestore';
import { DailyLog, FoodItem, MealEntry } from '../models/index';

@Injectable({ providedIn: 'root' })
export class DailyLogService {
	constructor(private firestore: Firestore) {}

	async getDailyLog(uid: string, date: string): Promise<DailyLog | null> {
		const ref = doc(this.firestore, `users/${uid}/dailyLogs/${date}`);
		const snapshot = await getDoc(ref);
		return snapshot.exists() ? (snapshot.data() as DailyLog) : null;
	}

	async saveDailyLog(uid: string, log: DailyLog) {
		const ref = doc(this.firestore, `users/${uid}/dailyLogs/${log.date}`);
		return await setDoc(ref, log);
	}

	async getRecentDailyLogs(uid: string, count: number): Promise<DailyLog[]> {
		const logsRef = collection(this.firestore, `users/${uid}/dailyLogs`);
		const q = query(logsRef, orderBy('date', 'desc'), limit(count));
		const snapshot = await getDocs(q);
		let logs: DailyLog[] = [];
		snapshot.forEach((docSnap) => logs.push(docSnap.data() as DailyLog));
		return logs;
	}

	async addItemToMeal(uid: string, date: string, mealId: string, item: FoodItem) {
		const log = await this.getDailyLog(uid, date);
		if (!log) return;
		const meal = log.meals.find((m) => m.id === mealId);
		if (!meal) return;

		meal.items = [...(meal.items ?? []), item];

		// recalculations
		meal.totalMealCalories = (meal.totalMealCalories ?? 0) + (item.calories ?? 0);
		meal.totalMealProteins = (meal.totalMealProteins ?? 0) + (item.proteins ?? 0);
		meal.totalMealCarbs = (meal.totalMealCarbs ?? 0) + (item.carbs ?? 0);
		meal.totalMealFats = (meal.totalMealFats ?? 0) + (item.fats ?? 0);

		this.recomputeDailyTotals(log);

		await this.saveDailyLog(uid, log);
	}

	async updateItemQuantity(uid: string, date: string, mealId: string, index: number, newQty: number) {
		const log = await this.getDailyLog(uid, date);
		if (!log) return;

		const meal = log.meals.find((m: any) => m.id === mealId);
		if (!meal) return;

		const item = meal.items[index];
		if (!item) return;

		const oldQty = item.default_quantity || 1;
		const scale = newQty / oldQty;

		item.default_quantity = newQty;
		item.calories = Math.round((item.calories || 0) * scale);
		item.proteins = +((item.proteins || 0) * scale).toFixed(1);
		item.carbs = +((item.carbs || 0) * scale).toFixed(1);
		item.fats = +((item.fats || 0) * scale).toFixed(1);

		// recompute meal totals
		this.recomputeMealTotals(meal);
        
		this.recomputeDailyTotals(log);

		await this.saveDailyLog(uid, log);
	}

	recomputeMealTotals(meal: MealEntry) {
		meal.totalMealCalories = meal.items.reduce((s, f) => s + (f.calories ?? 0), 0);
		meal.totalMealProteins = meal.items.reduce((s, f) => s + (f.proteins ?? 0), 0);
		meal.totalMealCarbs = meal.items.reduce((s, f) => s + (f.carbs ?? 0), 0);
		meal.totalMealFats = meal.items.reduce((s, f) => s + (f.fats ?? 0), 0);
	}

	recomputeDailyTotals(log: DailyLog) {
		log.totalDailyCalories = log.meals.reduce((s, m) => s + (m.totalMealCalories ?? 0), 0);
		log.totalDailyProteins = log.meals.reduce((s, m) => s + (m.totalMealProteins ?? 0), 0);
		log.totalDailyCarbs = log.meals.reduce((s, m) => s + (m.totalMealCarbs ?? 0), 0);
		log.totalDailyFats = log.meals.reduce((s, m) => s + (m.totalMealFats ?? 0), 0);
	}
}
