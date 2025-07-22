// daily-log.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from '@angular/fire/firestore';
import { DailyLog } from '../models/index';

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
}
