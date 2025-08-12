import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarStateService } from '../../services/calendar-state.service'; // path: adjust if needed
import { DisplayDatePipe } from 'src/app/pipes/display-date.pipe';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-calendar-header',
  standalone: true,
  imports: [CommonModule, DisplayDatePipe],
  templateUrl: './calendar-header.component.html',
  styleUrls: ['./calendar-header.component.css'],
})
export class CalendarHeaderComponent {
  /** roditelj može reći kad se učitava sadržaj koji ovisi o datumu */
  @Input() loading = false;

  constructor(public cal: CalendarStateService) {}

  async selectDate(date: string) {
    this.cal.selectDate(date);
  }

  goToPreviousDay() {
    this.cal.goPrevDay();
  }

  goToNextDay() {
    this.cal.goNextDay();
  }

  // helperi za async pipe u templatu nisu nužni – sve ide preko servisa
}
