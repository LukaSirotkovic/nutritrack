import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { DailyLog } from 'src/app/models/daily-log.model';
import { UserProfile } from 'src/app/models/user-profile.model';
import { DailyLogService } from 'src/app/services/daily-log.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { AppCircleProgressComponent } from 'src/app/components/app-circle-progress/app-circle-progress.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayDatePipe } from 'src/app/pipes/display-date.pipe';
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
    AppCircleProgressComponent,
    DisplayDatePipe,
  ],
})
export class DashboardPage implements OnInit {
  userProfile: UserProfile | null = null;
  todayLog: DailyLog | null = null;
  recentLogs: DailyLog[] = [];
  loading: boolean = true;
  // Standardizirani total-i:
  totalDailyCalories: number = 0;
  totalDailyProteins: number = 0;
  totalDailyCarbs: number = 0;
  totalDailyFats: number = 0;

  constructor(
    private userService: UserService,
    private dailyLogService: DailyLogService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loading = true;

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

    this.selectedDate = this.getTodayString();
    await this.loadAllForDate(this.selectedDate);
    this.generateWeek(today);

    this.loading = false;
  }

  activeSlide = 0;

  onSlideChange(event: any) {
    this.activeSlide = event.target.swiper?.activeIndex ?? 0;
  }

  get recentLogsExcludingToday(): DailyLog[] {
    if (!this.recentLogs) return [];
    const todayStr = this.getTodayString();
    // Filtriraj van današnji dan
    const logs = this.recentLogs.filter((log) => log.date !== todayStr);
    // Sortiraj po datumu (ako backend ne šalje sortirano)
    logs.sort((a, b) => (a.date < b.date ? 1 : -1));
    // Vrati max 7 (ionako si fetchao 7, ali ako ikad širiš logiku)
    return logs.slice(0, 7);
  }

  formatLogDate(logDate: string): string {
    const todayStr = this.getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toISOString().slice(0, 10);

    if (logDate === yestStr) {
      return 'Yesterday';
    }
    // Prikaži formatirano: "Monday, 22.07.2025."
    return (
      new Date(logDate)
        .toLocaleDateString('en-GB', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        .replace(/\//g, '.') + '.'
    );
  }

  getRemainingText(log: DailyLog): string {
    if (!this.userProfile) return '';
    const target = this.userProfile.calorie_target ?? 0;
    const delta = target - (log.totalDailyCalories ?? 0);

    if (delta > 0) {
      return `${delta} in deficit`;
    } else if (delta < 0) {
      return `${Math.abs(delta)} over the limit`;
    } else {
      return 'On target!';
    }
  }

  goToDailyLog(date: string) {
    this.router.navigate(['/daily-log'], { queryParams: { date } });
  }

  /* Calendar methods */

  weekDays: { date: string; weekday: string; day: string }[] = [];
  selectedDate: string = '';

  generateWeek(centerDate: string) {
    const base = new Date(centerDate);
    // Početak tjedna (ponedjeljak)
    const start = new Date(base);
    start.setDate(
      base.getDate() - (base.getDay() === 0 ? 6 : base.getDay() - 1)
    );
    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      this.weekDays.push({
        date: d.toISOString().slice(0, 10),
        weekday: d.toLocaleString('en-US', { weekday: 'short' }),
        day: d.getDate().toString(),
      });
    }
  }

  // if there is a lot of content chainging when user selects a new date then uncomment loading
  async selectDate(date: string) {
    if (this.isFuture(date)) return;
    this.selectedDate = date; /* 
    this.loading = true; */
    await this.loadAllForDate(date);
    this.generateWeek(date); /* 
    this.loading = false; */
  }

  async loadAllForDate(date: string) {
    const uid = this.authService.getUserId();
    if (!uid) return;

    // User profile samo jednom (ili možeš opet da bude sigurno)
    if (!this.userProfile) {
      this.userProfile = await this.userService.getUserProfile(uid);
    }

    // Uvijek daily log za trenutni odabrani datum!
    this.todayLog = await this.dailyLogService.getDailyLog(uid, date);

    this.totalDailyCalories = this.todayLog?.totalDailyCalories ?? 0;
    this.totalDailyProteins = this.todayLog?.totalDailyProteins ?? 0;
    this.totalDailyCarbs = this.todayLog?.totalDailyCarbs ?? 0;
    this.totalDailyFats = this.todayLog?.totalDailyFats ?? 0;

    // Recent logs možeš ili ostaviti samo zadnjih 7 dana, ili svaki put učitati (po želji)
    this.recentLogs = await this.dailyLogService.getRecentDailyLogs(uid, 7);
  }

  goToPreviusDay() {
    const previousDate = new Date(this.selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);
    if (previousDate < new Date('2024-01-01')) {
      return;
    }

    this.selectedDate = previousDate.toISOString().slice(0, 10);
    this.generateWeek(this.selectedDate);
  }

  goToNextDay() {
    const nextDateStr = new Date(this.selectedDate);
    nextDateStr.setDate(nextDateStr.getDate() + 1);
    const nextStr = nextDateStr.toISOString().slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);

    if (nextStr > todayStr) {
      return;
    }

    this.selectedDate = nextDateStr.toISOString().slice(0, 10);
    this.generateWeek(this.selectedDate);
  }

  isFuture(date: string) {
    return new Date(date) > new Date(this.getTodayString());
  }

  isThisWeek() {
    // Disable next if u tjednu je današnji datum
    return this.weekDays.some((day) => day.date === this.getTodayString());
  }

  isSelectedDate(date: string) {
    return date === this.selectedDate;
  }

  getTodayString(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }
}
