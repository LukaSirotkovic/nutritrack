// guards/entry.guard.ts
import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { switchMap, take, of } from 'rxjs';
import { UserService } from '../services/user.service';

export const entryGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const userService = inject(UserService);

  return user(auth).pipe(
    take(1),
    switchMap((firebaseUser) => {
      if (!firebaseUser) {
        return of(true); // Nije prijavljen → pusti na login/register
      }

      // Ako je prijavljen → provjeri onboarding
      return userService.isUserOnboarded(firebaseUser.uid).then((onboarded) => {
        if (onboarded) {
          router.navigateByUrl('/dashboard');
        } else {
          router.navigateByUrl('/onboarding');
        }
        return false; // spriječi ulaz na login/register
      });
    })
  );
};
