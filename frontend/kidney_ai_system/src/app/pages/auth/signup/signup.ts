import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApisService } from '../auth-apis-service';
import { StorageService } from '../../../core/services/storage/storage';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);

  private readonly authApisService = inject(AuthApisService);

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  get passwordMismatch(): boolean {
    return this.confirmPassword.length > 0 && this.password !== this.confirmPassword;
  }

  get formValid(): boolean {
    return (
      this.firstName.trim().length > 0 &&
      this.lastName.trim().length > 0 &&
      this.email.trim().length > 0 &&
      this.username.trim().length > 0 &&
      this.password.length >= 8 &&
      this.password === this.confirmPassword
    );
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (!this.formValid) return;
    this.isLoading = true;

    this.authApisService
      .signup({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        username: this.username,
        password: this.password,
        confirmPassword: this.confirmPassword,
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.storageService.accessToken = response.data.access_token;
          this.router.navigate(['home']);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  onLogin(): void {
    this.router.navigate(['auth/login']);
  }
}
