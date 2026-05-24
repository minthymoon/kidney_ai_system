import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientsApisService } from '../patients-apis-service';

@Component({
  selector: 'app-create-patient',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-patient.html',
  styleUrl: './create-patient.css',
})
export class CreatePatient {
  private readonly router = inject(Router);
  private readonly patientsApisService = inject(PatientsApisService);

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  phone_number: string = '';

  showPassword: boolean = false;
  isLoading: boolean = false;

  get formValid(): boolean {
    return (
      this.firstName.trim().length > 0 &&
      this.lastName.trim().length > 0 &&
      this.email.trim().length > 0 &&
      this.username.trim().length > 0 &&
      this.phone_number.trim().length > 0 &&
      this.password.length >= 8
    );
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.formValid) return;
    this.isLoading = true;

    this.patientsApisService
      .signup({
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        username: this.username,
        phone_number: this.phone_number,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['patients']);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['patients']);
  }
}
