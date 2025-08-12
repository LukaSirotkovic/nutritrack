import { Component, OnInit, inject } from '@angular/core';
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
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { DisplayDatePipe } from 'src/app/pipes/display-date.pipe';
import { CalendarHeaderComponent } from 'src/app/components/calendar-header/calendar-header.component';
import { CalendarStateService } from 'src/app/services/calendar-state.service';
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
    CommonModule,
    IonButton,
    SmartNumberPipe,
    DragDropModule,
    CalendarHeaderComponent,
  ],
})
export class DailyLogPage implements OnInit {
  loading: boolean = true;
  today = new Date();
  mealTypes: (
    | 'breakfast'
    | 'lunch'
    | 'dinner'
    | 'snack'
    | 'brunch'
    | string
  )[] = ['breakfast', 'lunch', 'dinner'];

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
    private router: Router,
    private route: ActivatedRoute,
    private cal: CalendarStateService
  ) {}

  async ngOnInit() {
    this.uid = this.authService.getUserId() ?? '';
    if (!this.uid) return;

    // reagiraj na promjenu datuma iz shared calendar state-a
    this.cal.selectedDate$.subscribe(async (date) => {
      this.today = new Date(date);
      this.todayString = date;
      await this.refreshMeals();
    });
  }

  get isToday() {
    const now = new Date();
    return (
      this.today.getFullYear() === now.getFullYear() &&
      this.today.getMonth() === now.getMonth() &&
      this.today.getDate() === now.getDate()
    );
  }

  private realToday = new Date(); // stvarni današnji datum za provjere

  get isTooOld() {
    // Napravi kopije (inače setHours mijenja original!)
    const realToday = new Date(this.realToday);
    const compareDay = new Date(this.today);

    // Uspoređuj bez vremena (samo datume)
    realToday.setHours(0, 0, 0, 0);
    compareDay.setHours(0, 0, 0, 0);

    const diffMs = realToday.getTime() - compareDay.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 1;
  }

  goToPreviousDay() {
    this.today = new Date(this.today.getTime() - 24 * 60 * 60 * 1000);
    this.todayString = this.today.toISOString().slice(0, 10);
    this.refreshMeals(); // Uvijek refreshaš prikaz
  }

  goToNextDay() {
    if (this.isToday) return; // NE ide u budućnost!
    this.today = new Date(this.today.getTime() + 24 * 60 * 60 * 1000);
    this.todayString = this.today.toISOString().slice(0, 10);
    this.refreshMeals();
  }

  async openMealActions(meal: MealEntry, event: Event) {
    event?.stopPropagation();
    const actionSheet = await this.alertCtrl.create({
      header: meal.type.charAt(0).toUpperCase() + meal.type.slice(1),
      buttons: [
        {
          text: 'Edit',
          handler: () => this.editMeal(meal),
        },
        {
          text: 'Duplicate',
          handler: () => this.duplicateMeal(meal),
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.removeMeal(meal.id),
        },
      ],
    });
    await actionSheet.present();
  }

  // Dupliciranje meal-a
  duplicateMeal(meal: MealEntry) {
    if (!this.dailyLog) return;
    const newMeal = {
      ...meal,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    this.dailyLog.meals.push(newMeal);
    this.dailyLogService.saveDailyLog(this.uid, this.dailyLog);
    this.refreshMeals();
  }

  async editMeal(meal: MealEntry) {
    const alert = await this.alertCtrl.create({
      header: 'Edit meal name',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Meal name',
          value: meal.type || '', // koristi meal.name (ako postoji), ili ostavi prazno
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (data) => {
            if (!data.name?.trim()) return false; // spriječi prazne
            meal.type = data.name;
            // Save changes
            await this.dailyLogService.saveDailyLog(this.uid, this.dailyLog!);
            await this.refreshMeals();
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  async refreshMeals() {
    this.loading = true;
    try {
      this.dailyLog = await this.dailyLogService.getDailyLog(
        this.uid,
        this.todayString
      );
      this.mealsByType = {};
      if (this.dailyLog && this.dailyLog.meals) {
        for (const meal of this.dailyLog.meals) {
          this.mealsByType[meal.type] = meal;
        }
        this.calculateDailyTotals(this.dailyLog);
      } else {
        // Ako nema obroka, sve resetiraj
        this.totalCalories = 0;
        this.totalProteins = 0;
        this.totalCarbs = 0;
        this.totalFats = 0;
      }
    } finally {
      this.loading = false;
    }
  }

  openMeal(type: string) {
    this.router.navigate(['/meal-details'], {
      queryParams: {
        type,
        date: this.todayString,
      },
    });
  }

  openMealDetails(meal: MealEntry) {
    if (this.isTooOld) return;
    this.router.navigate(['/meal-details'], {
      queryParams: {
        mealId: meal.id,
        date: this.todayString,
      },
    });
  }

  dropMeal(event: CdkDragDrop<MealEntry[]>) {
    if (!this.dailyLog?.meals) return;

    moveItemInArray(
      this.dailyLog.meals,
      event.previousIndex,
      event.currentIndex
    );

    this.dailyLogService.saveDailyLog(this.uid, this.dailyLog);
  }

  // --- DODAVANJE NOVOG OBROKA S POPUPOM ---
  async addNewMeal() {
    const alert = await this.alertCtrl.create({
      header: 'Choose a meal',
      inputs: [
        {
          name: 'custom',
          type: 'radio' as const,
          label: 'Custom',
          value: 'custom',
          checked: true,
          disabled: false,
        },
        ...this.mealTypes.map((type, i) => ({
          name: type,
          type: 'radio' as const,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          value: type,
        })),
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: async (selectedType) => {
            if (!selectedType) return false;

            if (selectedType === 'custom') {
              await alert.dismiss();
              // Otvori drugi alert za unos imena obroka!
              const nameAlert = await this.alertCtrl.create({
                header: 'Custom meal name',
                inputs: [
                  {
                    name: 'customName',
                    type: 'text',
                    placeholder: 'Enter meal name',
                  },
                ],
                buttons: [
                  { text: 'Cancel', role: 'cancel' },
                  {
                    text: 'Add',
                    handler: async (data) => {
                      const mealName = data.customName?.trim();
                      if (!mealName) return false;
                      await this.createMeal(mealName); // stvori meal s custom imenom
                      return true;
                    },
                  },
                ],
              });
              await nameAlert.present();
              return false; // ostani na prvom alertu dok korisnik ne unese custom name
            } else {
              await this.createMeal(selectedType);
              return true;
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async createMeal(type: string) {
    if (!this.dailyLog) {
      this.dailyLog = {
        date: this.todayString,
        meals: [],
        totalDailyCalories: 0,
        totalDailyProteins: 0,
        totalDailyCarbs: 0,
        totalDailyFats: 0,
      };
    }
    this.dailyLog.meals.push({
      id: Date.now().toString(),
      type: type,
      timestamp: new Date().toISOString(),
      items: [],
      totalMealCalories: 0,
      totalMealProteins: 0,
      totalMealCarbs: 0,
      totalMealFats: 0,
    });
    await this.dailyLogService.saveDailyLog(this.uid, this.dailyLog);
    await this.refreshMeals();
    this.openMeal(type); // Otvori odmah edit/add page ako želiš
  }

  // --- BRISANJE OBROKA S POTVRDOM ---
  async removeMeal(mealId: string) {
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

            // Makni meal s točno tim ID-om
            this.dailyLog.meals = this.dailyLog.meals.filter(
              (m) => m.id !== mealId
            );

            // Ažuriraj total-e!
            this.calculateDailyTotals(this.dailyLog);
            await this.dailyLogService.saveDailyLog(this.uid, this.dailyLog);

            // Refresha UI
          },
        },
      ],
    });
    await alert.present();
    await alert.onDidDismiss();
    await this.refreshMeals();
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
