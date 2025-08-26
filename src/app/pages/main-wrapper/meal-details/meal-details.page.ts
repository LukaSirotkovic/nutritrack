import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { MealEntry } from 'src/app/models/index';
import { DailyLogService } from 'src/app/services/daily-log.service';
import { AuthService } from 'src/app/services/auth.service';
import { DisplayDatePipe } from 'src/app/pipes/display-date.pipe';
import { CalendarStateService } from 'src/app/services/calendar-state.service';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { SmartNumberPipe } from '../../../pipes/smart-number.pipe';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'app-meal-details',
	templateUrl: './meal-details.page.html',
	styleUrls: ['./meal-details.page.css'],
	standalone: true,
	imports: [CommonModule, FormsModule, IonList, IonItem, IonLabel, DisplayDatePipe, SmartNumberPipe],
})
export class MealDetailsPage implements OnInit {
	meal?: MealEntry;
	mealDate?: string;
	totalCalories = 0;
	totalProteins = 0;
	totalCarbs = 0;
	totalFats = 0;
	loading = true;

	constructor(
		private route: ActivatedRoute,
		private dailyLogService: DailyLogService,
		private authService: AuthService,
		private router: Router,
		public cal: CalendarStateService,
		private alertCtrl: AlertController
	) {}

	async ngOnInit() {
		const uid = this.authService.getUserId() ?? '';
		const date = this.route.snapshot.queryParamMap.get('date');
		const mealId = this.route.snapshot.queryParamMap.get('mealId');
		if (!date || !mealId) {
			this.loading = false;
			return;
		}

		const dailyLog = await this.dailyLogService.getDailyLog(uid, date);
		if (!dailyLog) {
			this.loading = false;
			return;
		}

		this.meal = dailyLog.meals.find((m) => m.id === mealId);
		this.mealDate = date;
		this.loading = false;

		if (this.meal) {
			this.totalCalories = this.meal.items?.reduce((acc, f) => acc + (f.calories || 0), 0) || 0;
			this.totalProteins = this.meal.items?.reduce((acc, f) => acc + (f.proteins || 0), 0) || 0;
			this.totalCarbs = this.meal.items?.reduce((acc, f) => acc + (f.carbs || 0), 0) || 0;
			this.totalFats = this.meal.items?.reduce((acc, f) => acc + (f.fats || 0), 0) || 0;
		}
	}

	logFood() {
		const date = this.cal.getSelectedDate(); // getter iz servisa
		this.router.navigate(['/add-meal'], {
			queryParams: {
				date,
				mealId: this.meal?.id,
				type: this.meal?.type,
			},
		});
	}
	async scanBarcode() {
		try {
			// 1) je li podržano?
			const { supported } = await BarcodeScanner.isSupported();
			if (!supported) {
				// DEV/web: simulacija – unesi barcode ručno
				const code = await this.promptBarcode();
				if (code) this.goToProductDetails(code);
				return;
			}

			// 2) permissioni
			const perm = await BarcodeScanner.checkPermissions();
			if (perm.camera !== 'granted') {
				const req = await BarcodeScanner.requestPermissions();
				if (req.camera !== 'granted') return;
			}

			// 3) skeniraj
			// (plugin ima različite API-je; ovaj radi s mlkit paketom)
			const result =
				(await (BarcodeScanner as any).scan?.({
					formats: [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA, BarcodeFormat.UpcE],
				})) ??
				(await (BarcodeScanner as any).startScan?.({
					formats: [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA, BarcodeFormat.UpcE],
				}));

			const code = result?.barcodes?.[0]?.rawValue;
			if (code) this.goToProductDetails(code);
		} catch (e) {
			console.error(e);
			const code = await this.promptBarcode(); // fallback
			if (code) this.goToProductDetails(code);
		}
	}

	private async promptBarcode(): Promise<string | undefined> {
		const alert = await this.alertCtrl.create({
			header: 'DEV scan',
			inputs: [
				{
					name: 'code',
					type: 'text',
					placeholder: 'Upiši barkod (npr. 3851234567890)',
				},
			],
			buttons: [
				{ text: 'Cancel', role: 'cancel' },
				{ text: 'OK', role: 'confirm' },
			],
		});
		await alert.present();
		const { data, role } = await alert.onDidDismiss();
		return role === 'confirm' ? (data?.values?.code || '').trim() : undefined;
	}

	private goToProductDetails(barcode: string) {
		this.router.navigate(['/product-details'], {
			queryParams: {
				barcode,
				mealId: this.meal?.id,
				date: this.mealDate,
			},
		});
	}

	openFoodDetails(index: number) {
		this.router.navigate(['/food-details'], {
			queryParams: {
				date: this.mealDate,
				mealId: this.meal?.id,
				index, // ili pošalji item.id ako ga imaš
			},
		});
	}
}
