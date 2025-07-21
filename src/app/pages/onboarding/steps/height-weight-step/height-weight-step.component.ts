import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonLabel, IonText, IonRange } from '@ionic/angular/standalone';
import { UserProfile } from 'src/app/models/user-profile.model';

@Component({
  selector: 'app-height-weight-step',
  templateUrl: './height-weight-step.component.html',
  styleUrls: ['./height-weight-step.component.css'],
  standalone: true,
  imports: [IonLabel, IonText, IonRange, FormsModule, CommonModule],
})
export class HeightWeightStepComponent {
  @Input() userData!: Partial<UserProfile>;

  ngOnInit() {
    if (!this.userData.height) this.userData.height = 170;
    if (!this.userData.weight) this.userData.weight = 70;
  }
}
