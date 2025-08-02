import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { MealEntry } from 'src/app/models/index';
import { DailyLogService } from 'src/app/services/daily-log.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-meal-details',
  templateUrl: './meal-details.page.html',
  styleUrls: ['./meal-details.page.css'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
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

  constructor(
    private route: ActivatedRoute,
    private dailyLogService: DailyLogService,
    private authService: AuthService
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
      this.totalCalories =
        this.meal.items?.reduce((acc, f) => acc + (f.calories || 0), 0) || 0;
      this.totalProteins =
        this.meal.items?.reduce((acc, f) => acc + (f.proteins || 0), 0) || 0;
      this.totalCarbs =
        this.meal.items?.reduce((acc, f) => acc + (f.carbs || 0), 0) || 0;
      this.totalFats =
        this.meal.items?.reduce((acc, f) => acc + (f.fats || 0), 0) || 0;
    }
  }

  // Daj čitljiv datum
  get formattedDate(): string {
    if (!this.mealDate) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const check = new Date(this.mealDate);
    check.setHours(0, 0, 0, 0);

    const diffDays =
      (today.getTime() - check.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return (
      check
        .toLocaleDateString('en-GB', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        .replace(/\//g, '.') + '.'
    );
  }
}
