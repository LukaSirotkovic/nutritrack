import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonItem, IonLabel, IonNote } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DailyLogService } from 'src/app/services/daily-log.service';
import { AlertController } from '@ionic/angular';

type Seg = { cls: 'carbs' | 'fats' | 'prots'; pct: number; start: number };

@Component({
	selector: 'app-food-details',
	standalone: true,
	imports: [CommonModule, FormsModule, IonItem, IonLabel, IonNote],
	templateUrl: './food-details.page.html',
	styleUrls: ['./food-details.page.css'],
})
export class FoodDetailsPage implements OnInit {
	uid!: string;
	date!: string;
	mealId!: string;
	index!: number;

	// osnovni podaci
	item: any;
	mealType = '';
	unit: 'g' | 'ml' | 'pcs' | string = 'g';

	// količine
	baseQty = 0; // iz obroka (item.default_quantity)
	qty = 0; // trenutni unos

	// per-unit
	puCalories = 0;
	puProteins = 0;
	puCarbs = 0;
	puFats = 0;

	// skalirano na qty
	calories = 0;
	proteins = 0;
	carbs = 0;
	fats = 0;

	// postotci energije iz makroa
	pctP = 0;
	pctC = 0;
	pctF = 0;

	saving = false;

	constructor(
		private alertCtrl: AlertController,
		private route: ActivatedRoute,
		private router: Router,
		private auth: AuthService,
		private daily: DailyLogService
	) {}

	async ngOnInit() {
		this.uid = this.auth.getUserId()!;
		this.date = this.route.snapshot.queryParamMap.get('date')!;
		this.mealId = this.route.snapshot.queryParamMap.get('mealId')!;
		this.index = Number(this.route.snapshot.queryParamMap.get('index')!);

		const log = await this.daily.getDailyLog(this.uid, this.date);
		const meal = log?.meals.find((m: any) => m.id === this.mealId);
		if (!meal) {
			this.back();
			return;
		}

		this.mealType = meal.type;
		this.item = meal.items[this.index];
		if (!this.item) {
			this.back();
			return;
		}

		this.unit = this.item.unit || 'g';
		this.baseQty = Number(this.item.default_quantity || 100);
		this.qty = this.baseQty;

		// per-unit (npr. per 1g/ml/pcs)
		this.puCalories = (this.item.calories || 0) / this.baseQty;
		this.puProteins = (this.item.proteins || 0) / this.baseQty;
		this.puCarbs = (this.item.carbs || 0) / this.baseQty;
		this.puFats = (this.item.fats || 0) / this.baseQty;

		this.recompute();
	}

	back() {
		this.router.navigate(['/meal-details'], {
			queryParams: { date: this.date, mealId: this.mealId },
			replaceUrl: true,
		});
	}

	async openQtyPopup() {
		const alert = await this.alertCtrl.create({
			header: 'Serving Size',
			inputs: [
				{
					name: 'qty',
					type: 'number',
					placeholder: 'Enter amount',
					value: this.qty,
					attributes: { inputmode: 'decimal', min: 0, step: 'any' },
				},
			],
			buttons: [
				{ text: 'Cancel', role: 'cancel' },
				{
					text: 'OK',
					handler: (data) => {
						const n = parseFloat(data?.qty);
						if (!isFinite(n) || n <= 0) return false; // blokiraj nevaljano
						this.qty = n;
						this.recompute(); // osvježi kalorije + segmente
						return true;
					},
				},
			],
			mode: 'ios',
		});

		await alert.present();
	}

	private recompute() {
		this.calories = Math.round(this.puCalories * this.qty);
		this.proteins = +(this.puProteins * this.qty).toFixed(1);
		this.carbs = +(this.puCarbs * this.qty).toFixed(1);
		this.fats = +(this.puFats * this.qty).toFixed(1);

		const calP = this.proteins * 4;
		const calC = this.carbs * 4;
		const calF = this.fats * 9;
		const total = calP + calC + calF || 1;

		this.pctP = Math.round((calP / total) * 100);
		this.pctC = Math.round((calC / total) * 100);
		this.pctF = 100 - this.pctP - this.pctC;

		this.updateSegments();
	}

	async save() {
		if (!this.uid) return;
		this.saving = true;
		try {
			await this.daily.updateItemQuantity(this.uid, this.date, this.mealId, this.index, this.qty);
			this.back();
		} finally {
			this.saving = false;
		}
	}

	// opseg (r=52)
	circumference = 2 * Math.PI * 52;

	// mijenjamo na svako recompute() da resetira animaciju
	animKey = 0;

	segments: Array<{
		cls: 'carbs' | 'fats' | 'prots';
		pct: number;
		len: number; // duljina crte = (pct/100)*C
		dasharray: string; // npr. "120,326" — nije nužno kad koristimo CSS var
		dashoffset: number; // start pomak
		delay?: number; // opcionalno: blagi “stagger”
	}> = [];

	// zovi na KRAJU tvoje recompute()
	private updateSegments() {
		const C = this.circumference;

		const calP = (this.proteins ?? 0) * 4;
		const calC = (this.carbs ?? 0) * 4;
		const calF = (this.fats ?? 0) * 9;
		const total = calP + calC + calF;

		if (!total) {
			this.segments = [];
			return;
		}

		const pctC = (calC / total) * 100;
		const pctF = (calF / total) * 100;
		const pctP = 100 - pctC - pctF;

		const starts = [0, pctC, pctC + pctF];
		const pcts = [pctC, pctF, pctP] as const;
		const clss = ['carbs', 'fats', 'prots'] as const;

		this.segments = pcts.map((pct, i) => {
			const len = (pct / 100) * C;
			const dashoffset = -C * (starts[i] / 100);
			return {
				cls: clss[i],
				pct,
				len,
				dasharray: `${len},${C}`,
				dashoffset,
				delay: i * 0.06, // blagi “stagger” (po želji)
			};
		});

		// ➜ promijeni ključ da Angular re-mounta <circle> i CSS animacija krene ispočetka
		this.animKey++;
	}

	// u klasi dodaj i trackBy (pomaže restartu animacije)
	trackSeg = (_: number, __: any) => this.animKey; // key se mijenja → remount
}
