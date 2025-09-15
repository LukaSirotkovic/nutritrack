import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonList,
	IonItem,
	IonLabel,
	IonCard,
	IonCardHeader,
	IonCardTitle,
	IonCardContent,
	IonButton,
	IonBadge,
	IonContent,
	IonActionSheet,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodItem, MealEntry } from 'src/app/models/index';
import { DailyLogService } from 'src/app/services/daily-log.service';
import { AuthService } from 'src/app/services/auth.service';
import { DisplayDatePipe } from 'src/app/pipes/display-date.pipe';
import { CalendarStateService } from 'src/app/services/calendar-state.service';
import { BarcodeScanner, BarcodeFormat, Barcode } from '@capacitor-mlkit/barcode-scanning';
import { SmartNumberPipe } from '../../../pipes/smart-number.pipe';
import { AlertController, ActionSheetController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
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
		IonContent,
		IonActionSheet,
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

	/* BARCODE – native only */
	scanning = false;

	private BARCODE_FORMATS = [BarcodeFormat.Ean13, BarcodeFormat.Ean8, BarcodeFormat.UpcA, BarcodeFormat.UpcE];

	async scanBarcode() {
		this.scanning = true;

		// 0) supported?
		const { supported } = await BarcodeScanner.isSupported();
		if (!supported) {
			this.scanning = false;
			return;
		}

		const isAndroid = Capacitor.getPlatform() === 'android';

		// 1) Android: Code Scanner modul (ako postoji, koristimo native UI)
		let googleModuleAvailable = false;
		if (isAndroid && (BarcodeScanner as any).isGoogleBarcodeScannerModuleAvailable) {
			const res = await (BarcodeScanner as any).isGoogleBarcodeScannerModuleAvailable();
			googleModuleAvailable = !!res?.available;
			if (!googleModuleAvailable && (BarcodeScanner as any).installGoogleBarcodeScannerModule) {
				try {
					await (BarcodeScanner as any).installGoogleBarcodeScannerModule();
					googleModuleAvailable = true;
				} catch {
					/* fallback niže */
				}
			}
		}

		try {
			// 2) Preferiraj native UI (scan)
			if (googleModuleAvailable || Capacitor.getPlatform() === 'ios') {
				const { barcodes } = await (BarcodeScanner as any).scan({ formats: this.BARCODE_FORMATS });
				const b = this.pickFirstBarcode(barcodes);
				if (b) this.goToFoodDetailsWithBarcode(b);
				return;
			}

			// 3) Fallback: startScan (kamera ispod webviewa)
			await this.ensureCameraPermission();
			document.body.classList.add('scanner-active');
			const { barcodes } = await (BarcodeScanner as any).startScan({ formats: this.BARCODE_FORMATS });
			const b = this.pickFirstBarcode(barcodes);
			if (b) this.goToFoodDetailsWithBarcode(b);
		} catch (e) {
			console.error('Barcode scan error:', e);
		} finally {
			try {
				await (BarcodeScanner as any).stopScan?.();
			} catch {}
			document.body.classList.remove('scanner-active');
			this.scanning = false;
		}
	}

	private pickFirstBarcode(list: any[] = []) {
		return list.find((x) => x?.rawValue) ?? list[0] ?? null;
	}

	private async ensureCameraPermission() {
		const { camera } = await BarcodeScanner.checkPermissions();
		if (camera !== 'granted') {
			const res = await BarcodeScanner.requestPermissions();
			if (res.camera !== 'granted') throw new Error('Camera permission denied');
		}
	}

	// ✨ ovdje navigiramo na FOOD DETAILS
	private goToFoodDetailsWithBarcode(b: any) {
		const raw = String(b?.rawValue ?? b?.displayValue ?? '').trim();

		this.router.navigate(['/food-details'], {
			queryParams: {
				barcode: raw,
				mealId: this.meal?.id, // pretpostavljam da ih već imaš u ovoj klasi
				date: this.mealDate,
			},
			state: {
				barcodeObj: b, // cijeli objekt za dodatne info (format, cornerPoints…)
				source: 'scanner',
			},
		});
	}
}
