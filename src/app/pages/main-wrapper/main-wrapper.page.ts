import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonFooter,
  IonButtons,
  IonAvatar,
  IonButton,
} from '@ionic/angular/standalone';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-wrapper',
  templateUrl: './main-wrapper.page.html',
  styleUrls: ['./main-wrapper.page.css'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonFooter,
    RouterOutlet,
    IonButtons,
    IonAvatar,
    IonButton,
  ],
})
export class MainWrapperPage implements OnInit {
  userInitials: string = '';
  userPhotoUrl?: string;
  pageTitle: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    // ➤ Postavljanje naslova stranice prilikom promjene rute
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.setPageTitle(event.urlAfterRedirects);
      });

    // ➤ Dohvati korisničke podatke
    try {
      const result = await this.authService.getCurrentUser();
      const firebaseUser = result.user;
      const photoURL = firebaseUser.photoURL;

      if (photoURL) {
        this.userPhotoUrl = firebaseUser.photoURL;
;
      } else {
        const ime = result.firstName || '';
        const prezime = result.lastName || '';
        this.userInitials = `${ime[0] || ''}${prezime[0] || ''}`.toUpperCase();
      }
    } catch (error) {
      console.error('Greška pri dohvaćanju korisnika:', error);
    }
  }

  onImageError() {
    this.userPhotoUrl = undefined;
  }
  setPageTitle(url: string) {
    if (url.includes('/dashboard')) this.pageTitle = 'Dashboard';
    else if (url.includes('/daily-log')) this.pageTitle = 'Daily Log';
    else if (url.includes('/meal-details')) this.pageTitle = 'Meal Details';
    else if (url.includes('/add-meal')) this.pageTitle = 'Add Meal';
    else if (url.includes('/settings')) this.pageTitle = 'Settings';
    else this.pageTitle = '';
  }

  // ➤ Navigacija
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  addMeal() {
    this.router.navigate(['/add-meal']);
  }

  goToTodayMeals() {
    this.router.navigate(['/daily-log']);
  }

  goToNotifications() {
    // možeš ovdje otvoriti modal ili navigirati na /notifications
    console.log('Otvaranje notifikacija...');
  }
}
