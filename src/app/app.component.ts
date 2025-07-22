import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, IonFooter, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';

import { register } from 'swiper/element/bundle';

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private UserService: UserService
  ) {
    this.authService.currentUser$.subscribe(async (user) => {
      if (!user) {
        this.router.navigateByUrl('/login');
        return;
      }

      const profile = await this.UserService.getUserProfile(user.uid);

      if (profile && profile.calorieTarget) {
        this.router.navigateByUrl('/dashboard');
      } else {
        this.router.navigateByUrl('/onboarding');
      }
    });
  }
}
