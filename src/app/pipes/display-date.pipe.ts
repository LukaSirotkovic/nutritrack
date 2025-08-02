import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'displayDate',
  standalone: true,
})
export class DisplayDatePipe implements PipeTransform {
  transform(value: Date | string | undefined | null): string {
    if (!value) return '';
    // Pretvori u Date objekt
    const target = typeof value === 'string' ? new Date(value) : value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(target);
    date.setHours(0, 0, 0, 0);

    const diffDays = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      // Ovdje možeš promijeniti na HR jezik ako želiš
      return (
        date
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
}
