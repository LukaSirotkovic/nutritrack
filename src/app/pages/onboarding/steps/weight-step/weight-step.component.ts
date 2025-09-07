import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonText } from '@ionic/angular/standalone';
import { UserProfile } from 'src/app/models/user-profile.model';

@Component({
	selector: 'app-weight-step',
	standalone: true,
	imports: [CommonModule, IonText],
	templateUrl: './weight-step.component.html',
	styleUrls: ['./weight-step.component.css'],
})
export class WeightStepComponent implements AfterViewInit {
	@Input() userData!: Partial<UserProfile>;
	@Output() validityChange = new EventEmitter<boolean>();

	@ViewChild('ruler', { static: false }) rulerRef?: ElementRef<HTMLDivElement>;

	// RANGE (prilagodi po želji)
	min = 30;
	max = 200;
	step = 0.5;

	values: number[] = [];
	weight = 70; // default
	padHeight = 0;
	private TICK_H = 44; // mora odgovarati CSS .tick height
	private ready = false;

	constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

	ngOnInit() {
		const count = Math.round((this.max - this.min) / this.step) + 1;
		this.values = Array.from({ length: count }, (_, i) => +(this.min + i * this.step).toFixed(1));

		if (this.userData?.weight) this.weight = this.userData.weight!;
	}

	ngAfterViewInit() {
		// pričekaj da DOM bude gotov pa izmjeri
		setTimeout(() => {
			this.recalcPads();
			this.scrollToValue(this.weight, false);

			// tek kad je app stabilna dopuštamo onScroll update
			const sub = this.zone.onStable.subscribe(() => {
				this.ready = true;
				this.emitValidity();
				this.cdr.detectChanges();
				sub.unsubscribe();
			});
		}, 0);
	}

	private recalcPads() {
		const el = this.rulerRef?.nativeElement;
		if (!el) return;
		const tickH = this.getTickHeight();
		// buffer da min/max mogu sjesti točno pod srednju crtu
		this.padHeight = Math.max(0, el.clientHeight / 2 - tickH / 2);
	}
	private getTickHeight(): number {
		const tick = this.rulerRef?.nativeElement.querySelector('.tick') as HTMLElement | null;
		if (tick) {
			const h = parseFloat(getComputedStyle(tick).height);
			if (!Number.isNaN(h)) this.TICK_H = h;
		}
		return this.TICK_H;
	}

	onScroll() {
		if (!this.ready || !this.rulerRef) return;

		const el = this.rulerRef.nativeElement;
		const tickH = this.TICK_H;

		// indeks stavke čiji se CENTAR poravnava sa srednjom crtom
		// (bez korištenja clientHeight – time uklanjamo konst. pomak)
		const idxFloat = (el.scrollTop - this.padHeight) / tickH;
		const idx = Math.round(idxFloat);
		const clamped = Math.min(Math.max(idx, 0), this.values.length - 1);
		const val = this.values[clamped];

		this.zone.run(() => {
			if (Math.abs((this as any).height ?? (this as any).weight - val) > 0.0001) {
				// za height-step: this.height = val; za weight-step: this.weight = val;
				if ('height' in this) (this as any).height = val;
				else (this as any).weight = val;

				// upiši u userData
				if ('height' in this) this.userData.height = val;
				else this.userData.weight = val;

				this.emitValidity();
			}
		});
	}

	private scrollToValue(val: number, smooth = true) {
		if (!this.rulerRef) return;
		const idx = Math.max(
			0,
			this.values.findIndex((v) => Math.abs(v - val) < 0.001)
		);
		const top = idx * this.TICK_H + this.padHeight;
		this.rulerRef.nativeElement.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
	}

	private emitValidity() {
		this.validityChange.emit(Number.isFinite(this.weight));
	}

	@HostListener('window:resize')
	onResize() {
		if (!this.rulerRef) return;
		this.recalcPads();
		this.scrollToValue(this.weight, false);
		this.cdr.markForCheck();
	}

	// stilizacija linija (cijeli/half)
	isWhole(v: number) {
		return Math.abs(v - Math.round(v)) < 0.001;
	}
}
