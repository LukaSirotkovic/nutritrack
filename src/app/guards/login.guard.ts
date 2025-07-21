import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { switchMap, take, of } from 'rxjs';
import { FirestoreService } from '../services/firestore.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const firestore = inject(FirestoreService);

  return user(auth).pipe(
    take(1),
    switchMap((firebaseUser) => {
      if (!firebaseUser) return of(true);

      return firestore.getUserProfile(firebaseUser.uid).then((profile) => {
        if (profile?.calorieTarget) {
          router.navigateByUrl('/dashboard');
          return false;
        } else {
          router.navigateByUrl('/onboarding');
          return false;
        }
      });
    })
  );
};
