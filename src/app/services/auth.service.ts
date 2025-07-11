import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from '@angular/fire/firestore';

import { GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUser.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.next(user ?? null);
    });
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const q = query(
      collection(this.firestore, 'users'),
      where('username', '==', username)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  async register(email: string, password: string, username: string) {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    await setDoc(doc(this.firestore, 'users', uid), {
      uid,
      email,
      username,
      createdAt: new Date(),
    });

    return userCredential;
  }

  async loginWithUsername(username: string, password: string) {
    const q = query(
      collection(this.firestore, 'users'),
      where('username', '==', username)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('Ne postoji korisnik s tim korisničkim imenom.');
    }

    const user = snapshot.docs[0].data();
    const email = user['email'];

    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // 🔐 Google login
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async logout() {
    return signOut(this.auth);
  }

  getUserId(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }
}
