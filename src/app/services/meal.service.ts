// meal.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { MealEntry } from '../models/index';

@Injectable({ providedIn: 'root' })
export class MealService {
  constructor(private firestore: Firestore) {}

  async addMeal(uid: string, date: string, meal: MealEntry) {
    const mealsRef = collection(
      this.firestore,
      `users/${uid}/dailyLogs/${date}/meals`
    );
    return await addDoc(mealsRef, meal);
  }

  async getMealsForDay(uid: string, date: string): Promise<MealEntry[]> {
    const mealsRef = collection(
      this.firestore,
      `users/${uid}/dailyLogs/${date}/meals`
    );
    const snapshot = await getDocs(mealsRef);
    let meals: MealEntry[] = [];
    snapshot.forEach((docSnap) =>
      meals.push({ ...docSnap.data(), id: docSnap.id } as MealEntry)
    );
    return meals;
  }

  async updateMeal(
    uid: string,
    date: string,
    mealId: string,
    meal: Partial<MealEntry>
  ) {
    const mealRef = doc(
      this.firestore,
      `users/${uid}/dailyLogs/${date}/meals/${mealId}`
    );
    return await updateDoc(mealRef, meal);
  }

  async deleteMeal(uid: string, date: string, mealId: string) {
    const mealRef = doc(
      this.firestore,
      `users/${uid}/dailyLogs/${date}/meals/${mealId}`
    );
    return await deleteDoc(mealRef);
  }
}
