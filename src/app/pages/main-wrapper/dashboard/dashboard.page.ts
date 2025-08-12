import {
  Component,
  OnInit,
  OnDestroy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCircleProgressComponent } from 'src/app/components/app-circle-progress/app-circle-progress.component';
import { CalendarHeaderComponent } from 'src/app/components/calendar-header/calendar-header.component';

import { DailyLog } from 'src/app/models/daily-log.model';
import { UserProfile } from 'src/app/models/user-profile.model';

import { DailyLogService } from 'src/app/services/daily-log.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

import { Router } from '@angular/router';
import { CalendarStateService } from 'src/app/services/calendar-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, AppCircleProgressComponent, CalendarHeaderComponent],
})
export class DashboardPage implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  todayLog: DailyLog | null = null;
  recentLogs: DailyLog[] = [];
  loading = true;

  // Totals
  totalDailyCalories = 0;
  totalDailyProteins = 0;
  totalDailyCarbs = 0;
  totalDailyFats = 0;

  // swiper
  activeSlide = 0;

  private destroyed$ = new Subject<void>();
  selectedDate: any = this.cal.selectedDate$;

  constructor(
    private userService: UserService,
    private dailyLogService: DailyLogService,
    private authService: AuthService,
    private cal: CalendarStateService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loading = true;

    const uid = this.authService.getUserId();
    if (!uid) return;

    // Profil dohvaćamo jednom
    this.userProfile = await this.userService.getUserProfile(uid);

    // Reagiramo na promjenu odabranog datuma iz shared servisa
    this.cal.selectedDate$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((date) => this.loadAllForDate(date));
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSlideChange(event: any) {
    this.activeSlide = event.target?.swiper?.activeIndex ?? 0;
  }

  // --- Data helpers ---

  async loadAllForDate(date: string) {
    this.loading = true;
    const uid = this.authService.getUserId();
    if (!uid) return;

    // Dnevni log za odabrani datum
    this.todayLog = await this.dailyLogService.getDailyLog(uid, date);

    // Posljednjih 7 logova (za Activities list)
    this.recentLogs = await this.dailyLogService.getRecentDailyLogs(uid, 7);

    // Totali iz današnjeg loga
    this.totalDailyCalories = this.todayLog?.totalDailyCalories ?? 0;
    this.totalDailyProteins = this.todayLog?.totalDailyProteins ?? 0;
    this.totalDailyCarbs = this.todayLog?.totalDailyCarbs ?? 0;
    this.totalDailyFats = this.todayLog?.totalDailyFats ?? 0;

    this.loading = false;
  }

  get recentLogsExcludingToday(): DailyLog[] {
    if (!this.recentLogs) return [];
    const todayStr = this.cal.getTodayString();
    const logs = this.recentLogs.filter((l) => l.date !== todayStr);
    logs.sort((a, b) => (a.date < b.date ? 1 : -1));
    return logs.slice(0, 7);
  }

  formatLogDate(logDate: string): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toISOString().slice(0, 10);

    if (logDate === yestStr) return 'Yesterday';

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
    if (delta > 0) return `${delta} in deficit`;
    if (delta < 0) return `${Math.abs(delta)} over the limit`;
    return 'On target!';
  }

  goToDailyLog(date: string) {
    this.router.navigate(['/daily-log'], { queryParams: { date } });
  }
}
