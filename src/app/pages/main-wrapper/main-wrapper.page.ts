import { Component, OnInit, ViewChild } from '@angular/core';
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
	IonPopover,
	IonList,
	IonItem,
	IonLabel,
	IonRippleEffect,
	IonModal,
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
		IonPopover,
		IonList,
		IonItem,
		IonModal,
		IonRippleEffect,
	],
})
export class MainWrapperPage implements OnInit {
	userInitials: string = '';
	userPhotoUrl: string | null = null;

	pageTitle: string = '';

	@ViewChild('userMenu') userMenu?: IonPopover;

	constructor(private router: Router, private authService: AuthService) {}

	async ngOnInit() {
		// ➤ Postavljanje naslova stranice prilikom promjene rute
		this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: any) => {
			this.setPageTitle(event.urlAfterRedirects);
		});
		// ➤ Dohvati korisničke podatke
		const currentUser = await this.authService.getCurrentUser();
		console.log(currentUser);
		this.userPhotoUrl = currentUser.photoURL;
		this.userInitials = `${currentUser.displayName?.[0] ?? ''}`.toUpperCase();
	}

	onImageError() {
		this.userPhotoUrl = null;
	}
	setPageTitle(url: string) {
		if (url.includes('/dashboard')) this.pageTitle = 'Dashboard';
		else if (url.includes('/daily-log')) this.pageTitle = 'Daily Log';
		else if (url.includes('/meal-details')) this.pageTitle = 'Meal Details';
		else if (url.includes('/add-meal')) this.pageTitle = 'Add Meal';
		else if (url.includes('/settings')) this.pageTitle = 'Settings';
		else if (url.includes('/food-details')) this.pageTitle = 'Food Details';
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

	async logout() {
		await this.userMenu?.dismiss(); // zatvori popover
		await this.authService.logout();
		this.router.navigate(['/login'], { replaceUrl: true });
	}

	async goToSettings() {
		await this.userMenu?.dismiss(); // zatvori popover
		this.router.navigate(['/settings']);
	}

	quickOpen = false;

	onQuickAction(key: 'A' | 'B' | 'C' | 'D') {
		console.log('Quick action', key);
		this.quickOpen = false; // zatvori modal
	}

	onLogFood() {
		this.quickOpen = false; /* tvoja logika */
	}
	onScanBarcode() {
		this.quickOpen = false; /* tvoja logika */
	}
	onCreateMeal() {
		this.quickOpen = false; /* tvoja logika */
	}
	onAddWater() {
		this.quickOpen = false; /* tvoja logika */
	}
}
