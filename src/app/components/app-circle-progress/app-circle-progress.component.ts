import { Component, input, Input, SimpleChanges  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartNumberPipe } from 'src/app/pipes/smart-number.pipe';
@Component({
  selector: 'app-circle-progress',
  templateUrl: './app-circle-progress.component.html',
  styleUrls: ['./app-circle-progress.component.css'],
  standalone: true,
  imports: [CommonModule, SmartNumberPipe],
})
export class AppCircleProgressComponent {
  @Input() value: number = 0;
  @Input() max: number = 100;
  @Input() color: string = '#3b82f6';
  @Input() animate: boolean = false; // DODANO!
  @Input() displayValue: number = 0;
  @Input() label: string = '';
  @Input() unit: string = '';
  @Input() main: boolean = false;

  circumference = 2 * Math.PI * 45;
  dashoffset = this.circumference;

  ngOnChanges(changes: SimpleChanges) {
    // Kada slide postane aktivan (animate == true), resetiraj dashoffset
    if (changes['animate'] && this.animate) {
      this.resetAnimation();
    }
    // Kada value ili max promijeni (možda update), isto ažuriraj dashoffset
    if (changes['value'] || changes['max']) {
      this.updateDashoffset();
    }
  }

  resetAnimation() {
    // Prvo reset na full (prazan krug)
    this.dashoffset = this.circumference;
    setTimeout(() => {
      this.updateDashoffset();
    }, 10); // Daj browseru milisekundu da "vidi" promjenu, onda napuni
  }

  updateDashoffset() {
    const progress = Math.min(this.value / (this.max || 1), 1);
    this.dashoffset = this.circumference - progress * this.circumference;
  }
}
