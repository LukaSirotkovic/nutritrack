import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
  IonInput,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonText,
    IonButton,
    IonInput,
    RouterModule,
  ],
})
export class LoginPage {
  username = '';
  password = '';
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private toast: ToastController,
    private router: Router
  ) {}

  async loginWithUsername() {
    try {
      const result = await this.auth.loginWithUsername(
        this.username,
        this.password
      );
      this.showToast('Uspješna prijava!');
      console.log(result.user);

      const uid = result.user.uid; 
      const isOnboarded = await this.auth.isUserOnboarded(uid);

      this.showToast('Uspješna prijava!');

      if (isOnboarded) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/onboarding']);
      }
    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }

  async loginWithGoogle() {
    try {
      const result = await this.auth.loginWithGoogle();
      this.showToast('Uspješna prijava!');
      console.log(result.user);

      const uid = result.user.uid; 
      const isOnboarded = await this.auth.isUserOnboarded(uid);

      this.showToast('Uspješna prijava!');

      if (isOnboarded) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/onboarding']);
      }
    } catch (err: any) {
      this.errorMessage = err.message;
    }
  }

  async showToast(msg: string) {
    const toast = await this.toast.create({
      message: msg,
      duration: 2000,
      color: 'primary',
    });
    toast.present();
  }
}
