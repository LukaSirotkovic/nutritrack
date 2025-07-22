import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonFooter,
} from '@ionic/angular/standalone';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-wrapper',
  templateUrl: './main-wrapper.page.html',
  styleUrls: ['./main-wrapper.page.css'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonFooter,
    RouterOutlet,
  ],
})
export class MainWrapperPage {
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  addMeal() {
    this.router.navigate(['/add-meal']); // ili otvori modal, kako želiš
  }

  goToTodayMeals() {
    this.router.navigate(['/daily-log']);
  }
}
