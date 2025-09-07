import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
	IonItem,
	IonLabel,
	IonInput,
	IonText,
	IonCardContent,
	IonCard,
	IonDatetime,
	IonModal,
	IonContent,
	IonButton,
} from '@ionic/angular/standalone';
import { UserProfile } from 'src/app/models/user-profile.model';

@Component({
	selector: 'app-age-step',
	standalone: true,
	imports: [CommonModule, FormsModule, IonText, IonDatetime, IonCardContent, IonCard],
	templateUrl: './age-step.component.html',
	styleUrls: ['./age-step.component.css'],
})
export class AgeStepComponent {
	@Input() userData!: Partial<UserProfile>;
	@Output() validityChange = new EventEmitter<boolean>();

	minDate = this.isoDateFromYearsAgo(120); // najviše 120 god. unazad
	maxDate = this.isoDateFromYearsAgo(13); // min. 13 godina (sluša COPPA-like)
	age: string | null = null;
	ageDisplay: string | null = null;
	showDateModal = false;

	ngOnInit() {
		if (this.userData?.dateOfBirth) {
			// očekujemo ISO formu u bazi (YYYY-MM-DD)
			this.age = this.userData.dateOfBirth;
			this.validityChange.emit(true);
		} else {
			this.validityChange.emit(false);
		}
	}

	onAgeChange(ev: CustomEvent) {
		const iso = (ev.detail.value as string) || null;

		// ion-datetime može vratiti full ISO s vremenom; normaliziramo na YYYY-MM-DD
		const normalized = iso ? iso.substring(0, 10) : null;

		this.age = normalized;
		this.userData.dateOfBirth = normalized || undefined;
		this.validityChange.emit(!!normalized);
	}

	openDatePicker() {
		this.showDateModal = true;
	}

	closeDatePicker() {
		this.showDateModal = false;
	}

	private isoDateFromYearsAgo(years: number): string {
		const d = new Date();
		d.setFullYear(d.getFullYear() - years);
		// normaliziraj na lokalni dan (bez vremena)
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd}`;
	}
}
