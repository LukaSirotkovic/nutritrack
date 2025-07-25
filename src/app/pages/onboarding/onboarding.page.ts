import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { GenderStepComponent } from './steps/gender-step/gender-step.component';
import { AgeStepComponent } from './steps/age-step/age-step.component';
import { HeightWeightStepComponent } from './steps/height-weight-step/height-weight-step.component';
import { ActivityStepComponent } from './steps/activity-step/activity-step.component';
import { GoalStepComponent } from './steps/goal-step/goal-step.component';
import { SummaryStepComponent } from './steps/summary-step/summary-step.component';
import { UserProfile } from 'src/app/models/user-profile.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.css'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonButton],
})
export class OnboardingPage {
  stepIndex = 0;

  userData: Partial<UserProfile> = {};

  steps = [
    GenderStepComponent,
    AgeStepComponent,
    HeightWeightStepComponent,
    ActivityStepComponent,
    GoalStepComponent,
    SummaryStepComponent,
  ];

  constructor(
    private authService: AuthService,
    private UserService: UserService,
    private router: Router
  ) {}

  // === HANDLERI ===
  get currentComponent() {
    return this.steps[this.stepIndex];
  }

  async onComplete() {
    this.userData.createdAt = new Date().toISOString();

    console.log('Konačni profil korisnika:', this.userData);

    const uid = this.authService.getUserId();
    if (!uid) {
      console.error('Nema UID-a!');
      return;
    }

    try {
      await this.UserService.saveUserProfile(uid, this.userData as UserProfile);
      await this.UserService.saveUserProfile(uid, this.userData as UserProfile);
      console.log('Profil spremljen u Firestore!');
      this.router.navigateByUrl('/dashboard'); // Dodaj redirect
      // redirect to dashboard?
    } catch (err) {
      console.error('Greška pri spremanju:', err);
    }
  }

  // === NAVIGACIJA ===
  nextStep() {
    if (this.stepIndex === this.steps.length - 2) {
      const bmr = this.calculateBMR();
      const tdee = this.calculateTDEE(bmr);
      this.userData.calorieTarget = tdee;
      this.userData.proteinTarget = Math.round(1.8 * this.userData.weight!);
      this.userData.carbTarget = Math.round(4 * this.userData.weight!);
      this.userData.fatTarget = Math.round(1 * this.userData.weight!);
    }

    if (this.stepIndex < this.steps.length - 1) {
      this.stepIndex++;
    } else {
      this.onComplete();
    }
  }

  prevStep() {
    if (this.stepIndex > 0) {
      this.stepIndex--;
    }
  }

  // === KALKULACIJE ===
  private calculateBMR(): number {
    const { gender, weight, height, age } = this.userData;
    if (!gender || !weight || !height || !age) return 0;

    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      return 10 * weight + 6.25 * height - 5 * age;
    }
  }

  private calculateTDEE(bmr: number): number {
    const activity = this.userData.activityLevel;
    switch (activity) {
      case 'low':
        return Math.round(bmr * 1.2);
      case 'moderate':
        return Math.round(bmr * 1.55);
      case 'high':
        return Math.round(bmr * 1.9);
      default:
        return Math.round(bmr * 1.3);
    }
  }
}
