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
    const result = await signInWithPopup(this.auth, provider);
    const user = result.user;

    // Provjeri postoji li korisnik već u Firestore
    const userRef = doc(this.firestore, 'users', user.uid);
    const q = query(
      collection(this.firestore, 'users'),
      where('uid', '==', user.uid)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        username: user.email?.split('@')[0], // defaultni username
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    return result;
  }
  async isUserOnboarded(uid: string): Promise<boolean> {
    const snapshot = await getDocs(
      query(collection(this.firestore, 'users'), where('uid', '==', uid))
    );
    if (snapshot.empty) return false;

    const data = snapshot.docs[0].data();
    return !!data;
  }

  async logout() {
    return signOut(this.auth);
  }

  getUserId(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  async getCurrentUser(): Promise<{
    user: User;
    firstName?: string;
    lastName?: string;
  }> {
    const user = this.auth.currentUser;

    if (!user) {
      throw new Error('Korisnik nije prijavljen');
    }

    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDocs(
      query(collection(this.firestore, 'users'), where('uid', '==', user.uid))
    );

    let firstName: string | undefined;
    let lastName: string | undefined;

    if (!userSnap.empty) {
      const data = userSnap.docs[0].data();
      firstName = data['firstName'];
      lastName = data['lastName'];
    }

    return { user, firstName, lastName };
  }
}
