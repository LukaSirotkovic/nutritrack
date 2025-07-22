import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { switchMap, take, of } from 'rxjs';
import { UserService } from '../services/user.service';

export const onboardingGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const firestore = inject(UserService);

  return user(auth).pipe(
    take(1),
    switchMap((firebaseUser) => {
      if (!firebaseUser) {
        router.navigateByUrl('/login');
        return of(false);
      }

      return firestore.getUserProfile(firebaseUser.uid).then((profile) => {
        if (profile?.calorieTarget) {
          router.navigateByUrl('/dashboard');
          return false;
        }
        return true;
      });
    })
  );
};
