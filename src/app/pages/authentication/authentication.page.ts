import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
})
export class AuthenticationPage {
  email: string = ' ';
  password: string = ' ';

  constructor(private authService: AuthService) {}

  async login() {
    try {
      const result = await this.authService.login(this.email, this.password);
      console.log('Login success: ', result.user);
    } catch (error) {
      console.log('Login error: ', error);
    }
  }

  async register() {
    try {
      const result = await this.authService.register(this.email, this.password);
      console.log('Register success: ', result.user);
    } catch (error) {
      console.log('Register error: ', error);
    }
  }
}
