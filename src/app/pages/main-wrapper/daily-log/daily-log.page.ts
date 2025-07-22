import { Component, OnInit, inject } from '@angular/core';
import { MealService } from 'src/app/services/meal.service';
import { DailyLogService } from 'src/app/services/daily-log.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { DailyLog, MealEntry } from 'src/app/models/index';
import { SmartNumberPipe } from 'src/app/pipes/smart-number.pipe';

@Component({
  selector: 'app-daily-log',
  templateUrl: './daily-log.page.html',
  styleUrls: ['./daily-log.page.css'],
  standalone: true,
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonContent,
    CommonModule,
    IonButton,
    SmartNumberPipe,
  ],
})
export class DailyLogPage implements OnInit {
  today = new Date();
  mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack' | 'brunch')[] = [
    'breakfast',
    'lunch',
    'dinner',
  ];

  mealsByType: { [type: string]: MealEntry | undefined } = {};

  uid: string = '';
  todayString: string = '';

  dailyLog: DailyLog | null = null;

  // Totali za prikaz na vrhu (možeš koristiti u templateu ako želiš)
  totalCalories: number = 0;
  totalProteins: number = 0;
  totalCarbs: number = 0;
  totalFats: number = 0;

  private alertCtrl = inject(AlertController);

  constructor(
    private dailyLogService: DailyLogService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.uid = this.authService.getUserId() ?? '';
    this.todayString = this.today.toISOString().slice(0, 10);
    await this.refreshMeals();
  }

  async refreshMeals() {
    this.dailyLog = await this.dailyLogService.getDailyLog(
      this.uid,
      this.todayString
    );
    this.mealsByType = {};
    if (this.dailyLog && this.dailyLog.meals) {
      for (const meal of this.dailyLog.meals) {
        this.mealsByType[meal.type] = meal;
      }
      // Izračunaj total svaki put kad se refresha dailyLog!
      this.calculateDailyTotals(this.dailyLog);
    } else {
      // Ako nema obroka, sve resetiraj
      this.totalCalories = 0;
      this.totalProteins = 0;
      this.totalCarbs = 0;
      this.totalFats = 0;
    }
  }

  openMeal(type: string) {
    this.router.navigate(['/add-meal'], {
      queryParams: {
        type,
        date: this.todayString,
      },
    });
  }

  // --- DODAVANJE NOVOG OBROKA S POPUPOM ---
  async addNewMeal() {
    const alert = await this.alertCtrl.create({
      header: 'Choose a meal',
      inputs: this.mealTypes.map((type, i) => ({
        name: type,
        type: 'radio',
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type,
        checked: i === 0,
        disabled: !!this.mealsByType[type], // Disable ako već postoji!
      })),
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (selectedType) => {
            if (!selectedType) return;

            // Dodaj meal u dailyLog odmah (prazan meal)
            if (!this.dailyLog) {
              // Ako nema dailyLog-a za danas, napravi novi
              this.dailyLog = {
                date: this.todayString,
                meals: [],
                totalDailyCalories: 0,
                totalDailyProteins: 0,
                totalDailyCarbs: 0,
                totalDailyFats: 0,
              };
            }

            // Dodaj novi meal (prazan)
            this.dailyLog.meals.push({
              id: Date.now().toString(),
              type: selectedType,
              timestamp: new Date().toISOString(),
              items: [],
              totalMealCalories: 0,
              totalMealProteins: 0,
              totalMealCarbs: 0,
              totalMealFats: 0,
            });

            // Ažuriraj total-e!
            this.calculateDailyTotals(this.dailyLog);

            // Spremi u bazu
            await this.dailyLogService.saveDailyLog(this.uid, this.dailyLog);

            // Refresha UI
            await this.refreshMeals();

            // Možeš odmah otvoriti add-meal page za daljnje editiranje
            this.openMeal(selectedType);
          },
        },
      ],
    });
    await alert.present();
  }

  // --- BRISANJE OBROKA S POTVRDOM ---
  async removeMeal(mealType: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm deletion',
      message: 'Are you sure you want to delete your meal?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            if (!this.dailyLog) return;

            // Makni meal iz arraya
            this.dailyLog.meals = this.dailyLog.meals.filter(
              (m) => m.type !== mealType
            );

            // Ažuriraj total-e!
            this.calculateDailyTotals(this.dailyLog);

            // Spremi novi daily log u bazu
            await this.dailyLogService.saveDailyLog(this.uid, this.dailyLog);

            // Refresha UI
            await this.refreshMeals();
          },
        },
      ],
    });
    await alert.present();
  }

  // --- Zbroji sve makronutrijente i kalorije za dan ---
  private calculateDailyTotals(dailyLog: DailyLog) {
    let totalCalories = 0;
    let totalProteins = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    if (dailyLog.meals && dailyLog.meals.length) {
      for (const meal of dailyLog.meals) {
        totalCalories += meal.totalMealCalories ?? 0;
        totalProteins += meal.totalMealProteins ?? 0;
        totalCarbs += meal.totalMealCarbs ?? 0;
        totalFats += meal.totalMealFats ?? 0;
      }
    }

    // Spremi u dailyLog za bazu i za UI
    dailyLog.totalDailyCalories = totalCalories;
    dailyLog.totalDailyProteins = totalProteins;
    dailyLog.totalDailyCarbs = totalCarbs;
    dailyLog.totalDailyFats = totalFats;

    // Spremi u komponente za UI prikaz (ako želiš prikaz na ekranu)
    this.totalCalories = totalCalories;
    this.totalProteins = totalProteins;
    this.totalCarbs = totalCarbs;
    this.totalFats = totalFats;
  }
}
