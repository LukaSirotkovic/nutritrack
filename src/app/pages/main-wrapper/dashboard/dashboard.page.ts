import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonText } from '@ionic/angular/standalone';
import { DailyLog } from 'src/app/models/daily-log.model';
import { UserProfile } from 'src/app/models/user-profile.model';
import { MealService } from 'src/app/services/meal.service';
import { DailyLogService } from 'src/app/services/daily-log.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { AppCircleProgressComponent } from 'src/app/components/app-circle-progress/app-circle-progress.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonText,
    AppCircleProgressComponent,
  ],
})
export class DashboardPage implements OnInit {
  userProfile: UserProfile | null = null;
  todayLog: DailyLog | null = null;
  recentLogs: DailyLog[] = [];

  // Standardizirani total-i:
  totalDailyCalories: number = 0;
  totalDailyProteins: number = 0;
  totalDailyCarbs: number = 0;
  totalDailyFats: number = 0;

  constructor(
    private userService: UserService,
    private dailyLogService: DailyLogService,
    private mealService: MealService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const uid = this.authService.getUserId();
    if (!uid) return;

    this.userProfile = await this.userService.getUserProfile(uid);
    if (!this.userProfile) return;

    const today = this.getTodayString();
    this.todayLog = await this.dailyLogService.getDailyLog(uid, today);
    this.recentLogs = await this.dailyLogService.getRecentDailyLogs(uid, 7);

    // Standardizirano: uzmi total iz dailyLog
    this.totalDailyCalories = this.todayLog?.totalDailyCalories ?? 0;
    this.totalDailyProteins = this.todayLog?.totalDailyProteins ?? 0;
    this.totalDailyCarbs = this.todayLog?.totalDailyCarbs ?? 0;
    this.totalDailyFats = this.todayLog?.totalDailyFats ?? 0;
  }

  getTodayString(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }

  activeSlide = 0;

  onSlideChange(event: any) {
    this.activeSlide = event.target.swiper?.activeIndex ?? 0;
  }
}
