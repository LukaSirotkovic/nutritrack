import { inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { switchMap, take, map, of, from } from 'rxjs';
import { UserService } from '../services/user.service';

export const entryGuard: CanActivateFn = () => {
	const auth = inject(Auth);
	const router = inject(Router);
	const userService = inject(UserService);

	return user(auth).pipe(
		take(1),
		switchMap((firebaseUser) => {
			// Nije prijavljen → pusti na login/register
			if (!firebaseUser) return of(true);

			// Prijavljen → odluči kamo
			return from(userService.isUserOnboarded(firebaseUser.uid)).pipe(
				map((onboarded) => (onboarded ? router.createUrlTree(['/dashboard']) : router.createUrlTree(['/onboarding'])))
			);
		})
	);
};
