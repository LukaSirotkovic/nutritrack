import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return user(auth).pipe(
    take(1),
    map((firebaseUser) => {
      if (firebaseUser) {
        return true;
      } else {
        router.navigateByUrl('/login');
        return false;
      }
    })
  );
};
