import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonText, IonButton } from '@ionic/angular/standalone';
import { UserProfile } from 'src/app/models/user-profile.model'; // Dodaj import ako već nemaš

@Component({
  selector: 'app-gender-step',
  standalone: true,
  imports: [CommonModule, FormsModule, IonText, IonButton],
  templateUrl: './gender-step.component.html',
  styleUrls: ['./gender-step.component.css'],
})
export class GenderStepComponent {
  @Input() userData!: Partial<UserProfile>;

  selectGender(selected: 'male' | 'female') {
    if (this.userData) {
      this.userData.gender = selected;
    }
  }

  ngOnInit() {
    if (!this.userData?.gender) {
      this.userData.gender = '';
    }
  }
}
