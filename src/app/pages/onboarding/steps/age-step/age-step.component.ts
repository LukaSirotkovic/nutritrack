import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonText,
} from '@ionic/angular/standalone';
import { UserProfile } from 'src/app/models/user-profile.model';

@Component({
  selector: 'app-age-step',
  standalone: true,
  imports: [CommonModule, FormsModule, IonItem, IonLabel, IonInput, IonText],
  templateUrl: './age-step.component.html',
  styleUrls: ['./age-step.component.css'],
})
export class AgeStepComponent {
  @Input() userData!: Partial<UserProfile>;

  age: number | null = null;

  onAgeChange() {
    if (this.age !== null && this.age > 0) {
      this.userData.age = this.age;
    }
  }

  ngOnInit() {
    if (this.userData?.age) {
      this.age = this.userData.age;
    }
  }
}
