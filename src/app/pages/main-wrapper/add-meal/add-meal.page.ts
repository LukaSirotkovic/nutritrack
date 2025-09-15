import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonList,
	IonItem,
	IonLabel,
	IonSearchbar,
	ToastController,
	IonButton,
	IonSkeletonText,
	IonBadge,
	IonContent,
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DailyLogService } from 'src/app/services/daily-log.service';
import { AuthService } from 'src/app/services/auth.service';
import { FoodItem } from 'src/app/models';

@Component({
	selector: 'app-add-meal',
	templateUrl: './add-meal.page.html',
	styleUrls: ['./add-meal.page.css'],
	standalone: true,
	imports: [CommonModule, FormsModule, IonList, IonItem, IonLabel, IonSearchbar, IonButton, IonSkeletonText, IonBadge, IonContent],
})
export class AddMealPage {
	searchTerm = '';
	loading = false;
	foodList: any[] = [];

	// Info o trenutnom obroku iz query parametara
	mealType: any = '';
	date: string = '';
	private readonly PAGE_SIZE = 10;
	private toastCtrl = inject(ToastController);

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private dailyLogService: DailyLogService,
		private authService: AuthService,
		private router: Router,
		private location: Location
	) {}

	ngOnInit() {
		// Dohvati tip obroka i datum iz query parametara (primjer: ?type=lunch&date=2025-07-21)
		this.route.queryParams.subscribe((params) => {
			this.mealType = params['type'] || 'breakfast';
			this.date = params['date'] || new Date().toISOString().slice(0, 10);
		});
		this.fetchFood();
	}

	fetchFood() {
		this.loading = true;
		const proxyUrl = 'https://corsproxy.io/?';
		// globalna baza umjesto hr.openfoodfacts.org
		const apiUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=50`;

		this.http.get<any>(proxyUrl + encodeURIComponent(apiUrl)).subscribe({
			next: (result) => {
				this.foodList = (result.products || [])
					.filter((p: any) => (p.product_name || '').trim().length > 0)
					.filter((p: any) => !/^\d/.test(p.product_name.trim()))
					.filter((p: any) => (p.nutriments?.['energy-kcal_100g'] || 0) > 0)
					.sort((a: any, b: any) => (a.product_name || '').localeCompare(b.product_name || ''))
					.slice(0, this.PAGE_SIZE);
				this.loading = false;
			},
			error: () => {
				this.loading = false;
			},
		});
	}

	async onSearch() {
		if (!this.searchTerm.trim()) {
			this.fetchFood();
			return;
		}
		this.loading = true;
		const proxyUrl = 'https://corsproxy.io/?';
		const apiUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
			this.searchTerm
		)}&search_simple=1&action=process&json=1&page_size=50`;

		this.http.get<any>(proxyUrl + encodeURIComponent(apiUrl)).subscribe({
			next: (result) => {
				this.foodList = (result.products || [])
					.filter((p: any) => (p.product_name || '').trim().length > 0)
					.filter((p: any) => !/^\d/.test(p.product_name.trim()))
					.filter((p: any) => (p.nutriments?.['energy-kcal_100g'] || 0) > 0)
					.sort((a: any, b: any) => (a.product_name || '').localeCompare(b.product_name || ''))
                    .slice(0, this.PAGE_SIZE);
				this.loading = false;
			},
			error: () => {
				this.loading = false;
			},
		});
	}

	// --- Dodavanje hrane u meal ---
	async addFoodToMeal(food: any) {
		const uid = this.authService.getUserId();
		if (!uid) return;

		// Pretvori podatke u svoj FoodItem model
		const foodItem: FoodItem = {
			food_id: food.id || food._id || food.product_name + Date.now(),
			name: food.product_name,
			default_quantity: 100, // default: 100g
			unit: 'g',
			calories: food.nutriments?.['energy-kcal_100g'] || 0,
			proteins: food.nutriments?.['proteins_100g'] || 0,
			carbs: food.nutriments?.['carbohydrates_100g'] || 0,
			fats: food.nutriments?.['fat_100g'] || 0,
		};

		// Učitaj DailyLog, pronađi ili dodaj MealEntry, dodaj namirnicu i spremi!
		let dailyLog = await this.dailyLogService.getDailyLog(uid, this.date);
		if (!dailyLog) {
			dailyLog = {
				date: this.date,
				meals: [],
				totalDailyCalories: 0,
				totalDailyProteins: 0,
				totalDailyCarbs: 0,
				totalDailyFats: 0,
			};
		}

		let meal = dailyLog.meals.find((m: any) => m.type === this.mealType);
		if (!meal) {
			meal = {
				id: this.mealType + '-' + Date.now(),
				type: this.mealType,
				timestamp: new Date().toISOString(),
				items: [],
				totalMealCalories: 0,
				totalMealProteins: 0,
				totalMealCarbs: 0,
				totalMealFats: 0,
			};
			dailyLog.meals.push(meal);
		}

		meal.items.push(foodItem);

		// Re-calculate meal totals
		meal.totalMealCalories = meal.items.reduce((sum: number, item: any) => sum + (item.calories || 0), 0);
		meal.totalMealProteins = meal.items.reduce((sum: number, item: any) => sum + (item.proteins || 0), 0);
		meal.totalMealCarbs = meal.items.reduce((sum: number, item: any) => sum + (item.carbs || 0), 0);
		meal.totalMealFats = meal.items.reduce((sum: number, item: any) => sum + (item.fats || 0), 0);

		this.recalculateDailyTotals(dailyLog);

		// Spremi dailyLog natrag u bazu
		await this.dailyLogService.saveDailyLog(uid, dailyLog);

		// Toast potvrda
		const toast = await this.toastCtrl.create({
			message: `Added "${foodItem.name}"`,
			duration: 1000,
			color: 'success',
			position: 'bottom',
		});
		toast.present();
	}

	private recalculateDailyTotals(dailyLog: any) {
		let totalCalories = 0;
		let totalProteins = 0;
		let totalCarbs = 0;
		let totalFats = 0;

		for (const meal of dailyLog.meals) {
			totalCalories += meal.totalMealCalories ?? 0;
			totalProteins += meal.totalMealProteins ?? 0;
			totalCarbs += meal.totalMealCarbs ?? 0;
			totalFats += meal.totalMealFats ?? 0;
		}

		dailyLog.totalDailyCalories = totalCalories;
		dailyLog.totalDailyProteins = totalProteins;
		dailyLog.totalDailyCarbs = totalCarbs;
		dailyLog.totalDailyFats = totalFats;
	}

	goBack() {
		if (window.history.length > 1) {
			this.location.back();
			return;
		}

		// fallback: ručno složi URL iz query parametara na ovoj stranici
		const mealId = this.route.snapshot.queryParamMap.get('mealId') || undefined;
		const date = this.route.snapshot.queryParamMap.get('date') || undefined;

		this.router.navigate(['/meal-details'], {
			queryParams: { mealId, date },
		});
	}
}
