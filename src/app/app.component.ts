import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.router.navigateByUrl('/dashboard');
      } else {
        this.router.navigateByUrl('/authentication');
      }
    });
  }
}
