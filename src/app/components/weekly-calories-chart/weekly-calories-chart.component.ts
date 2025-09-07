import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

type Point = { date: string; calories: number; target: number };

@Component({
	selector: 'app-weekly-calories-chart',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './weekly-calories-chart.component.html',
	styleUrls: ['./weekly-calories-chart.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyCaloriesChartComponent {
	@Input() data: Point[] = []; // 7 elemenata
	@Output() select = new EventEmitter<string>(); // date ISO

	@Input() selectedDate: string | null = null; // ⟵ highlight

	width = 320; // možeš responsivno, ali za MVP neka je fiksno pa skali kroz CSS
	height = 160;
	padding = { top: 12, right: 12, bottom: 24, left: 12 };

	get maxY(): number {
		if (!this.data?.length) return 0;
		const maxVal = Math.max(...this.data.map((d) => Math.max(d.calories, d.target)));
		// malo “headrooma” da target linija ne bude zalijepljena za vrh
		const nice = Math.ceil(maxVal / 100) * 100;
		return Math.max(nice, 500); // minimalno 500 da graf ne skače prenisko
	}

	barX(i: number): number {
		const W = this.width - this.padding.left - this.padding.right;
		const n = this.data.length || 1;
		const gap = 8;
		const barW = Math.max(14, (W - gap * (n - 1)) / n);
		return this.padding.left + i * (barW + gap);
	}

	barW(): number {
		const W = this.width - this.padding.left - this.padding.right;
		const n = this.data.length || 1;
		const gap = 8;
		return Math.max(14, (W - gap * (n - 1)) / n);
	}

	y(val: number): number {
		const H = this.height - this.padding.top - this.padding.bottom;
		const ratio = Math.min(1, val / this.maxY);
		// y=0 na dnu → SVG y veći dolje
		return this.padding.top + H * (1 - ratio);
	}

	barH(val: number): number {
		const H = this.height - this.padding.top - this.padding.bottom;
		const ratio = Math.min(1, val / this.maxY);
		return Math.max(2, H * ratio);
	}

	dayLabel(dateISO: string): string {
		const d = new Date(dateISO);
		return d.toLocaleDateString(undefined, { weekday: 'short' }); // Mon, Tue...
	}

	// boja bara
	barClass(d: Point): string {
		if (!d.target) return 'bar neutral';
		return d.calories <= d.target ? 'bar green' : 'bar red';
	}

	onSelect(date: string) {
		this.select.emit(date);
	}
}
