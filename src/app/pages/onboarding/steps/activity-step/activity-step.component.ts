import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonText, IonButton } from '@ionic/angular/standalone';
import { UserProfile } from 'src/app/models/user-profile.model';

@Component({
	selector: 'app-activity-step',
	templateUrl: './activity-step.component.html',
	styleUrls: ['./activity-step.component.css'],
	standalone: true,
	imports: [CommonModule, FormsModule, IonButton, IonText],
})
export class ActivityStepComponent {
	@Input() userData!: Partial<UserProfile>;

	selectActivity(level: 'low' | 'moderate' | 'high') {
		this.userData.activity_level = level;
	}

	ngOnInit() {
		if (!this.userData.activity_level) {
			this.userData.activity_level = '';
		}
	}
}
