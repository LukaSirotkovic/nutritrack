import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonText, IonButton, IonInput, IonList } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth.service';

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
		IonList,
	],
})
export class LoginPage {
	username = '';
	password = '';
	errorMessage = '';
	loading = false;

	constructor(private auth: AuthService, private toast: ToastController, private router: Router) {}

	async loginWithUsername() {
		this.loading = true;
		this.errorMessage = '';
		try {
			await this.auth.loginWithUsername(this.username, this.password);

			await this.router.navigateByUrl('/', { replaceUrl: true });

			this.showToast('Uspješna prijava!');
		} catch (err: any) {
			this.errorMessage = err?.message ?? 'Neuspjela prijava.';
			this.showToast(this.errorMessage);
		} finally {
			this.loading = false;
		}
	}

	async loginWithGoogle() {
		this.loading = true;
		this.errorMessage = '';
		try {
			await this.auth.loginWithGoogle();

			// neutralno: pusti guard da odluči kamo (dashboard / onboarding)
			await this.router.navigateByUrl('/', { replaceUrl: true });

			this.showToast('Uspješna prijava!');
		} catch (err: any) {
			this.errorMessage = err?.message ?? 'Neuspjela prijava.';
			this.showToast(this.errorMessage);
		} finally {
			this.loading = false;
		}
	}

	private async showToast(msg: string) {
		const toast = await this.toast.create({ message: msg, duration: 2000, color: 'primary' });
		await toast.present();
	}
}
