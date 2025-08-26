// user.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { UserProfile } from '../models/user-profile.model';
import { NotificationSetting } from '../models/notification-setting.model';

@Injectable({ providedIn: 'root' })
export class UserService {
	constructor(private firestore: Firestore) {}

	async saveUserProfile(uid: string, data: Partial<UserProfile>) {
		const ref = doc(this.firestore, `users/${uid}`);
		return setDoc(
			ref,
			{
				...data,
				onboarded: true, // ✅ označi da je korisnik završio onboarding
			},
			{ merge: true } // ✅ ne prepisuj postojeća polja
		);
	}

	async isUserOnboarded(uid: string): Promise<boolean> {
		const ref = doc(this.firestore, 'users', uid);
		const snap = await getDoc(ref);
		if (!snap.exists()) return false;

		const d = snap.data() as any;
		// primarno: flag
		if (d?.onboarded === true) return true;
		// fallback za stare korisnike: ima li ključna polja?
		return !!(d?.calorie_target && d?.gender && d?.height && d?.weight && d?.activity_level && d?.goal);
	}

	async getUserProfile(uid: string): Promise<any | undefined> {
		const userRef = doc(this.firestore, 'users', uid);
		const userSnap = await getDoc(userRef);

		if (userSnap.exists()) {
			return userSnap.data();
		} else {
			return undefined;
		}
	}

	async saveNotificationSetting(uid: string, data: NotificationSetting) {
		const ref = doc(this.firestore, `users/${uid}/settings/notification`);
		return await setDoc(ref, data);
	}

	async getNotificationSetting(uid: string): Promise<NotificationSetting | null> {
		const ref = doc(this.firestore, `users/${uid}/settings/notification`);
		const snapshot = await getDoc(ref);
		return snapshot.exists() ? (snapshot.data() as NotificationSetting) : null;
	}
}
