import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
} from '@ionic/angular/standalone';
import { UserProfile } from 'src/app/models/user-profile.model';

@Component({
  selector: 'app-summary-step',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
  ],
  templateUrl: './summary-step.component.html',
  styleUrls: ['./summary-step.component.css'],
})
export class SummaryStepComponent {
  @Input() userData!: Partial<UserProfile>;
}
