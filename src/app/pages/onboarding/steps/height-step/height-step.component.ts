import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonText } from '@ionic/angular/standalone';
import { UserProfile } from 'src/app/models/user-profile.model';
import { B } from '@angular/cdk/bidi-module.d-IN1Vp56w';

@Component({
	selector: 'app-height-step',
	standalone: true,
	imports: [CommonModule, IonText],
	templateUrl: './height-step.component.html',
	styleUrls: ['./height-step.component.css'],
})
export class HeightStepComponent implements AfterViewInit {
	@Input() userData!: Partial<UserProfile>;
	@Output() validityChange = new EventEmitter<boolean>();

	@ViewChild('ruler', { static: false }) rulerRef?: ElementRef<HTMLDivElement>;

	/** range i korak */
	min = 120;
	max = 240;
	step = 0.5;

	values: number[] = [];
	height: number = 180; // default (ne diramo u ranoj fazi)
	padHeight = 0; // dinamički buffer gore/dolje
	private TICK_H = 44; // mora pratiti CSS (tick.height)
	private ready = false; // tek kad je zona stabilna, dopuštamo promjene

	constructor(private cdr: ChangeDetectorRef, private zone: NgZone) {}

	ngOnInit() {
		const count = Math.round((this.max - this.min) / this.step) + 1;
		this.values = Array.from({ length: count }, (_, i) => +(this.min + i * this.step).toFixed(1));

		if (this.userData?.height) {
			this.height = this.userData.height!;
		}
	}

	/** Small helper to defer to the next microtask */
	private defer(fn: () => void) {
		Promise.resolve().then(fn); // or queueMicrotask(fn)
	}

	ngAfterViewInit() {
		// IMPORTANT: Defer *all* writes that affect template bindings to the next tick
		this.defer(() => {
			this.recalcPads(); // writes padHeight
			this.scrollToValue(this.height, false); // sets initial scroll position (no smooth)

			// Allow onScroll updates only after the app is stable
			const sub = this.zone.onStable.subscribe(() => {
				// Defer the "ready" flip too, so it doesn't collide with the current check
				this.defer(() => {
					this.ready = true;
					this.emitValidity();
					this.cdr.detectChanges(); // start a fresh check with the new values
					sub.unsubscribe();
				});
			});

			// One detectChanges after our initial measurements
			this.cdr.detectChanges();
		});
	}

	/** centra top/bottom padding prema stvarnoj visini kotača */
	private recalcPads() {
		const el = this.rulerRef?.nativeElement;
		const tickH = this.getTickHeight();
		if (el) {
			this.padHeight = Math.max(0, (el.clientHeight - tickH) / 2);
		}
	}

	private getTickHeight(): number {
		const firstTick = this.rulerRef?.nativeElement.querySelector('.tick') as HTMLElement | null;
		if (firstTick) {
			const h = parseFloat(getComputedStyle(firstTick).height);
			if (!Number.isNaN(h)) this.TICK_H = h;
		}
		return this.TICK_H;
	}

	onScroll() {
		if (!this.ready || !this.rulerRef) return;

		const el = this.rulerRef.nativeElement;
		const tickH = this.TICK_H; // 44 ili 40 (čitamo u getTickHeight)
		const centerY = el.scrollTop + el.clientHeight / 2;

		// centar prvog ticka: padHeight + tickH/2
		const idxFloat = (centerY - this.padHeight - tickH / 2) / tickH;
		const idx = Math.round(idxFloat);
		const clamped = Math.min(Math.max(idx, 0), this.values.length - 1);
		const val = this.values[clamped];

		// update odmah (u Angular zoni) – bez programskog skrolanja!
		this.zone.run(() => {
			if (Math.abs((this.height ?? 0) - val) > 0.0001) {
				this.height = val;
				this.userData.height = val;
				this.emitValidity();
			}
		});
	}

	private scrollToValue(val: number, smooth = true) {
		const idx = Math.max(
			0,
			this.values.findIndex((v) => Math.abs(v - val) < 0.001)
		);

		const el = this.rulerRef?.nativeElement;
		if (el) {
			const top = idx * this.TICK_H + this.padHeight;
			el.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
		}
	}

	private emitValidity() {
		this.validityChange.emit(!!this.height);
	}

	@HostListener('window:resize')
	onResize() {
		// Defer resize adjustments to avoid mid-check writes
		this.defer(() => {
			this.recalcPads();
			this.scrollToValue(this.height, false);
			this.cdr.markForCheck();
		});
	}

	isWhole(v: number) {
		return Math.abs(v - Math.round(v)) < 0.001;
	}
	isActive(v: number) {
		return Math.abs(v - this.height) < 0.001;
	}
}
