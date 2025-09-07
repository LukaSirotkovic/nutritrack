import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonText } from '@ionic/angular/standalone';
import { UserProfile } from 'src/app/models/user-profile.model';

@Component({
	selector: 'app-goal-step',
	standalone: true,
	imports: [CommonModule, FormsModule, IonButton, IonText],
	templateUrl: './goal-step.component.html',
	styleUrls: ['./goal-step.component.css'],
})
export class GoalStepComponent {
	@Input() userData!: Partial<UserProfile>;

	ngOnInit() {
		// Ako nema postavljen goal, postavi default
		if (!this.userData.goal) {
			this.userData.goal = '';
		}
	}

	selectGoal(goal: 'maintain' | 'gain' | 'lose' | '') {
		this.userData.goal = goal;
	}
}
