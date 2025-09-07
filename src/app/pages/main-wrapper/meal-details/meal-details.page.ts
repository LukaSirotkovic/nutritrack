import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonBadge } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodItem, MealEntry } from 'src/app/models/index';
import { DailyLogService } from 'src/app/services/daily-log.service';
import { AuthService } from 'src/app/services/auth.service';
import { DisplayDatePipe } from 'src/app/pipes/display-date.pipe';
import { CalendarStateService } from 'src/app/services/calendar-state.service';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { SmartNumberPipe } from '../../../pipes/smart-number.pipe';
import { AlertController, ActionSheetController } from '@ionic/angular';

@Component({
	selector: 'app-meal-details',
	templateUrl: './meal-details.page.html',
	styleUrls: ['./meal-details.page.css'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		IonList,
		IonItem,
		IonLabel,
		DisplayDatePipe,
		SmartNumberPipe,
		IonCard,
		IonCardHeader,
		IonCardTitle,
		IonCardContent,
		IonButton,
		IonBadge,
	],
})
export class MealDetailsPage implements OnInit {
	meal?: MealEntry;
	mealDate?: string;
	totalCalories = 0;
	totalProteins = 0;
	totalCarbs = 0;
	totalFats = 0;
	loading = true;

	private uid = '';
	private dailyLog?: any; // držimo cijeli dnevnik u komponenti

	constructor(
		private route: ActivatedRoute,
		private dailyLogService: DailyLogService,
		private authService: AuthService,
		private router: Router,
		public cal: CalendarStateService,
		private alertCtrl: AlertController,
		private actionSheetCtrl: ActionSheetController,
		private cdr: ChangeDetectorRef
	) {}

	async ngOnInit() {
		this.uid = this.authService.getUserId() ?? '';

		const date = this.route.snapshot.queryParamMap.get('date');
		const mealId = this.route.snapshot.queryParamMap.get('mealId');
		if (!date || !mealId) {
			this.loading = false;
			return;
		}

		this.dailyLog = await this.dailyLogService.getDailyLog(this.uid, date);
		if (!this.dailyLog) {
			this.loading = false;
			return;
		}

		this.meal = this.dailyLog.meals.find((m: any) => m.id === mealId);
		this.mealDate = date;
		this.loading = false;

		this.updateMealHeaderTotals();
	}

	// -------- DRY helpers --------
	private recalcMealTotals(meal: any) {
		const items = meal.items || [];
		meal.totalMealCalories = items.reduce((s: number, it: any) => s + (it.calories || 0), 0);
		meal.totalMealProteins = items.reduce((s: number, it: any) => s + (it.proteins || 0), 0);
		meal.totalMealCarbs = items.reduce((s: number, it: any) => s + (it.carbs || 0), 0);
		meal.totalMealFats = items.reduce((s: number, it: any) => s + (it.fats || 0), 0);
	}

	private recalcDailyTotals(dailyLog: any) {
		let c = 0,
			p = 0,
			cb = 0,
			f = 0;
		for (const m of dailyLog.meals || []) {
			c += m.totalMealCalories ?? 0;
			p += m.totalMealProteins ?? 0;
			cb += m.totalMealCarbs ?? 0;
			f += m.totalMealFats ?? 0;
		}
		dailyLog.totalDailyCalories = c;
		dailyLog.totalDailyProteins = p;
		dailyLog.totalDailyCarbs = cb;
		dailyLog.totalDailyFats = f;
	}

	private async saveDailyLog() {
		if (!this.uid || !this.dailyLog) return;
		this.recalcDailyTotals(this.dailyLog);
		await this.dailyLogService.saveDailyLog(this.uid, this.dailyLog);
		this.updateMealHeaderTotals();
	}

	private updateMealHeaderTotals() {
		if (!this.meal) {
			this.totalCalories = this.totalProteins = this.totalCarbs = this.totalFats = 0;
			return;
		}
		const items = this.meal.items || [];
		this.totalCalories = items.reduce((acc, f) => acc + (f.calories || 0), 0);
		this.totalProteins = items.reduce((acc, f) => acc + (f.proteins || 0), 0);
		this.totalCarbs = items.reduce((acc, f) => acc + (f.carbs || 0), 0);
		this.totalFats = items.reduce((acc, f) => acc + (f.fats || 0), 0);
	}
	// ------- /DRY helpers --------

	logFood() {
		const date = this.cal.getSelectedDate();
		this.router.navigate(['/add-meal'], {
			queryParams: {
				date,
				mealId: this.meal?.id,
				type: this.meal?.type,
			},
		});
	}

	async openItemMenu(index: number, item: any) {
		const sheet = await this.actionSheetCtrl.create({
			header: item.name || 'Options',
			mode: 'ios', // centrirani gumbi
			buttons: [
				{ text: 'Edit', handler: () => this.openFoodDetails(index) },
				{ text: 'Delete', role: 'destructive', handler: () => this.confirmRemoveItem(index) },
				{ text: 'Cancel', role: 'cancel' },
			],
		});
		await sheet.present();
	}

	private async confirmRemoveItem(index: number) {
		const alert = await this.alertCtrl.create({
			header: 'Remove food',
			message: 'Are you sure you want to remove food?',
			buttons: [
				{ text: 'Cancel', role: 'cancel' },
				{ text: 'Remove', role: 'destructive', handler: () => this.removeItem(index) },
			],
		});
		await alert.present();
	}

	private async removeItem(index: number) {
		if (!this.meal || !this.dailyLog || !this.meal.items) return;

		// 1) ukloni item
		this.meal.items.splice(index, 1);

		// 2) recalculations za meal
		this.recalcMealTotals(this.meal);

		// 3) ažuriraj dailyLog.meals (ili ukloni meal ako je prazan)
		const mealIdx = this.dailyLog.meals.findIndex((m: any) => m.id === this.meal!.id);

		// 4) spremi promjene i osvježi header totals
		await this.saveDailyLog();

		this.cdr.detectChanges();
	}

	openFoodDetails(index: number) {
		this.router.navigate(['/food-details'], {
			queryParams: { date: this.mealDate, mealId: this.meal?.id, index },
		});
	}

	goBack() {
		this.router.navigate(['/daily-log']);
	}

	/* BARCODE */
	/* BARCODE */
	/* BARCODE – native only */
	async scanBarcode() {
		try {
			const { supported } = await BarcodeScanner.isSupported();
			if (!supported) {
				// npr. web ili simulator – samo izađi ili prikaži toast
				console.warn('Barcode scanning not supported on this platform.');
				return;
			}

			// Permissions
			const perm = await BarcodeScanner.checkPermissions();
			if (perm.camera !== 'granted') {
				const req = await BarcodeScanner.requestPermissions();
				if (req.camera !== 'granted') return;
			}

			// Nativni skener (plugin ima .scan ili .startScan ovisno o platformi)
			const result =
				(await (BarcodeScanner as any).scan?.({
					formats: [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA, BarcodeFormat.UpcE],
				})) ??
				(await (BarcodeScanner as any).startScan?.({
					formats: [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA, BarcodeFormat.UpcE],
				}));

			// Neki buildovi vraćaju result.content, neki result.barcodes[0].rawValue
			const code = result?.barcodes?.[0]?.rawValue ?? result?.content;
			if (code) {
				this.goToBarCodeDetails(String(code).trim());
			}
		} catch (e) {
			console.error('Barcode error:', e);
		} finally {
			// Ako je startScan otvorio kontinuirani session, zatvori ga
			try {
				await (BarcodeScanner as any).stopScan?.();
			} catch {}
		}
	}

	private goToBarCodeDetails(barcode: string) {
		this.router.navigate(['/product-details'], {
			queryParams: { barcode, mealId: this.meal?.id, date: this.mealDate },
		});
	}
}
