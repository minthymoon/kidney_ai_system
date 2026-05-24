import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminsApisService } from '../admins-apis-service';

@Component({
  selector: 'app-create-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-admin.html',
  styleUrl: './create-admin.css',
})
export class CreateAdmin {
  private readonly router = inject(Router);
  private readonly adminsApisService = inject(AdminsApisService);

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

    this.adminsApisService
      .createAdmin({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        username: this.username,
        password: this.password,
        confirmPassword: this.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['admins']);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['admins']);
  }
}
