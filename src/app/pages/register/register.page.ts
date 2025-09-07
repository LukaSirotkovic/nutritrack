import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonText, IonButton, IonInput, IonList } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonLabel,
    IonText,
    IonButton,
    RouterModule,
    IonInput,
    IonList
],
})
export class RegisterPage {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private auth: AuthService, private toast: ToastController, 
    private router: Router) {}

  async register() {
  if (this.password !== this.confirmPassword) {
    this.errorMessage = 'Lozinke se ne podudaraju.';
    return;
  }

  const usernameTaken = await this.auth.isUsernameTaken(this.username);
  if (usernameTaken) {
    this.errorMessage = 'Korisničko ime je zauzeto.';
    return;
  }

  try {
    const result = await this.auth.register(
      this.email,
      this.password,
      this.username,
    );
    this.showToast('Registracija uspješna!');
    this.router.navigate(['/login']);
  } catch (err: any) {
    this.errorMessage = 'Došlo je do pogreške.';
  }
}


  async showToast(msg: string) {
    const toast = await this.toast.create({
      message: msg,
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }
}
