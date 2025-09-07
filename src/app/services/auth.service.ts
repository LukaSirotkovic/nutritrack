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

import { Firestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from '@angular/fire/firestore';

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
		const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
		const uid = userCredential.user.uid;

		await setDoc(
			doc(this.firestore, 'users', uid),
			{
				email,
				username,
				created_at: serverTimestamp(), // ⬅️ umjesto createdAt: new Date()
				onboarded: false,
			},
			{ merge: true }
		);

		return userCredential;
	}

	// ✅ LOGIN preko username-a
	async loginWithUsername(username: string, password: string) {
		const q = query(collection(this.firestore, 'users'), where('username', '==', username));
		const snapshot = await getDocs(q);
		if (snapshot.empty) throw new Error('User not found.');
		const email = snapshot.docs[0].data()['email'];
		return signInWithEmailAndPassword(this.auth, email, password);
	}

	// ✅ LOGIN preko Google-a
	async loginWithGoogle() {
		const provider = new GoogleAuthProvider();
		const result = await signInWithPopup(this.auth, provider);
		const user = result.user;

		const userRef = doc(this.firestore, 'users', user.uid);
		const snap = await getDoc(userRef);

		const username = user.email?.split('@')[0] || 'user';
		const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`;

		if (!snap.exists()) {
			await setDoc(
				userRef,
				{
					email: user.email ?? '',
					username,
					displayName: user.displayName ?? username,
					photoURL: user.photoURL ?? fallbackAvatar,
					created_at: serverTimestamp(),
					onboarded: false,
					calorie_target: null,
				},
				{ merge: true }
			);
		} else {
			// po želji: dopuni displayName/photoURL ako fale
			const data = snap.data();
			const updates: any = {};
			if (!data['displayName'] && (user.displayName || username)) updates.displayName = user.displayName ?? username;
			if (!data['photoURL'] && (user.photoURL || fallbackAvatar)) updates.photoURL = user.photoURL ?? fallbackAvatar;
			if (Object.keys(updates).length) await updateDoc(userRef, updates);
		}

		// osvježi Firebase Auth profil samo ako treba
		if (!user.displayName || !user.photoURL) {
			await updateProfile(user, {
				displayName: user.displayName ?? username,
				photoURL: user.photoURL ?? fallbackAvatar,
			});
		}

		return result;
	}

	// ✅ Provjera postoji li korisnik u Firestore
	async isUsernameTaken(username: string): Promise<boolean> {
		const q = query(collection(this.firestore, 'users'), where('username', '==', username));
		const snapshot = await getDocs(q);
		return !snapshot.empty;
	}

	// ✅ Provjera je li korisnik prošao onboarding
	async isUserOnboarded(uid: string): Promise<boolean> {
		const ref = doc(this.firestore, 'users', uid);
		const snap = await getDoc(ref);
		if (!snap.exists()) return false;
		const d = snap.data() as any;

		if (d.onboarded === true) return true;

		// prilagodi ovdje nazive koje stvarno koristiš u appu
		const hasAll =
			!!d.gender &&
			!!d.dateOfBirth &&
			Number.isFinite(d.height) &&
			Number.isFinite(d.weight) &&
			!!d.activity_level &&
			!!d.goal &&
			Number.isFinite(d.calorie_target);

		return hasAll;
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
