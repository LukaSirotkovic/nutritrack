import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { FirestoreService } from './services/firestore.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private firestoreService: FirestoreService
  ) {
    this.authService.currentUser$.subscribe(async (user) => {
      if (!user) {
        this.router.navigateByUrl('/login');
        return;
      }

      const profile = await this.firestoreService.getUserProfile(user.uid);

      if (profile && profile.calorieTarget) {
        this.router.navigateByUrl('/dashboard');
      } else {
        this.router.navigateByUrl('/onboarding');
      }
    });
  }
}
