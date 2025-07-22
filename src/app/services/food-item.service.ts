// food-item.service.ts
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
import { FoodItem } from '../models/index';

@Injectable({ providedIn: 'root' })
export class FoodItemService {
  constructor(private firestore: Firestore) {}

  // Dodaj novu namirnicu (u globalnu kolekciju ili korisničku, prilagodi po potrebi)
  async addFoodItem(food: FoodItem) {
    const foodRef = collection(this.firestore, `foodItems`);
    return await addDoc(foodRef, food);
  }

  async getAllFoodItems(): Promise<FoodItem[]> {
    const foodRef = collection(this.firestore, `foodItems`);
    const snapshot = await getDocs(foodRef);
    let items: FoodItem[] = [];
    snapshot.forEach((docSnap) =>
      items.push({ ...docSnap.data(), id: docSnap.id } as FoodItem)
    );
    return items;
  }

  async updateFoodItem(foodId: string, food: Partial<FoodItem>) {
    const foodRef = doc(this.firestore, `foodItems/${foodId}`);
    return await updateDoc(foodRef, food);
  }

  async deleteFoodItem(foodId: string) {
    const foodRef = doc(this.firestore, `foodItems/${foodId}`);
    return await deleteDoc(foodRef);
  }
}
