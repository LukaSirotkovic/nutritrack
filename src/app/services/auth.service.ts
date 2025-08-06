import { Injectable } from '@angular/core';
import {
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';

import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user ?? null);
    });
  }

  // ✅ REGISTRACIJA
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

  // ✅ LOGIN preko username-a
  async loginWithUsername(username: string, password: string) {
    const q = query(
      collection(this.firestore, 'users'),
      where('username', '==', username)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('User not found.');
    }

    const userDoc = snapshot.docs[0].data();
    const email = userDoc['email'];

    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ LOGIN preko Google-a
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const user = result.user;

    const userRef = doc(this.firestore, 'users', user.uid);

    // Provjeri postoji li u Firestore bazi
    const snapshot = await getDocs(
      query(collection(this.firestore, 'users'), where('uid', '==', user.uid))
    );

    const username = user.email?.split('@')[0] || 'user';

    if (snapshot.empty) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        username,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        calorie_target: null,
      });
    }

    // Ako nije postavljen photoURL u auth profilu
    if (!user.displayName || !user.photoURL) {
      await updateProfile(user, {
        displayName: username,
        photoURL: `https://ui-avatars.com/api/?name=${username}&background=random`,
      });
    }

    return result;
  }

  // ✅ Provjera postoji li korisnik u Firestore
  async isUsernameTaken(username: string): Promise<boolean> {
    const q = query(
      collection(this.firestore, 'users'),
      where('username', '==', username)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  // ✅ Provjera je li korisnik prošao onboarding
  async isUserOnboarded(uid: string): Promise<boolean> {
    const snapshot = await getDocs(
      query(collection(this.firestore, 'users'), where('uid', '==', uid))
    );
    if (snapshot.empty) return false;

    const data = snapshot.docs[0].data();
    return !!data['calorie_target'];
  }

  // ✅ Trenutni korisnik
  getUserId(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  async getCurrentUser(): Promise<User> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User is not logged in');
    return user;
  }

  // ✅ Logout
  async logout() {
    return signOut(this.auth);
  }
}
