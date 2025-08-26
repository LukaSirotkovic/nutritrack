// guards/app.gate.ts
import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { take, switchMap, map, of, from } from 'rxjs';
import { UserService } from '../services/user.service';

export const appGate: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const userService = inject(UserService);

  return user(auth).pipe(
    take(1),
    switchMap(u => {
      if (!u) return of(router.createUrlTree(['/login']));
      return from(userService.isUserOnboarded(u.uid)).pipe(
        map(onb => onb ? true : router.createUrlTree(['/onboarding']))
      );
    })
  );
};
