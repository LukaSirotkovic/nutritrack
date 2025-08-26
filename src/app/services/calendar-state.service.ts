import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type WeekDay = { date: string; weekday: string; day: string };

@Injectable({ providedIn: 'root' })
export class CalendarStateService {
  private readonly STORAGE_KEY = 'selectedDate';
  private _selectedDate$ = new BehaviorSubject<string>(this.getInitialDate());
  selectedDate$ = this._selectedDate$.asObservable();

  private _weekDays$ = new BehaviorSubject<WeekDay[]>([]);
  weekDays$ = this._weekDays$.asObservable();

  constructor() {
    this.generateWeek(this._selectedDate$.value);

    // kad se promijeni datum → regeneriraj tjedan + spremi u storage
    this.selectedDate$.subscribe((d) => {
      this.generateWeek(d);
      try {
        localStorage.setItem(this.STORAGE_KEY, d);
      } catch {}
    });
  }

  resetToToday() {
    const today = this.getTodayString();
    this._selectedDate$.next(today);
  }
  /** Init iz localStorage ili današnji */
  private getInitialDate(): string {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) return saved;
    } catch {}
    return this.getTodayString();
  }

  getTodayString(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }

  getSelectedDate(): string {
    return this._selectedDate$.value;
  }

  isFuture(date: string): boolean {
    return new Date(date) > new Date(this.getTodayString());
  }

  isSelected(date: string): boolean {
    return date === this._selectedDate$.value;
  }

  selectDate(date: string) {
    if (this.isFuture(date)) return;
    this._selectedDate$.next(date);
  }

  goPrevDay() {
    const d = new Date(this._selectedDate$.value);
    d.setDate(d.getDate() - 1);
    this.selectDate(d.toISOString().slice(0, 10));
  }

  goNextDay() {
    const d = new Date(this._selectedDate$.value);
    d.setDate(d.getDate() + 1);
    const nextStr = d.toISOString().slice(0, 10);
    const todayStr = this.getTodayString();
    if (nextStr > todayStr) return;
    this.selectDate(nextStr);
  }

  /** Generira pon–ned tjedan oko centerDate */
  generateWeek(centerDate: string) {
    const base = new Date(centerDate);
    const start = new Date(base);
    // ponedjeljak kao početak
    start.setDate(
      base.getDate() - (base.getDay() === 0 ? 6 : base.getDay() - 1)
    );

    const week: WeekDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      week.push({
        date: d.toISOString().slice(0, 10),
        weekday: d.toLocaleString('en-US', { weekday: 'short' }),
        day: d.getDate().toString(),
      });
    }
    this._weekDays$.next(week);
  }
}
