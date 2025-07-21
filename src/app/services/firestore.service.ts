import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc  } from '@angular/fire/firestore';
import { UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  async saveUserProfile(uid: string, data: UserProfile) {
    const ref = doc(this.firestore, `users/${uid}`);
    return await setDoc(ref, data);
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(this.firestore, `users/${uid}`);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
}
}
