import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientsApisService } from '../patients-apis-service';

@Component({
  selector: 'app-create-patient',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-patient.html',
  styleUrl: './create-patient.css',
})
export class CreatePatient {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly patientsApisService = inject(PatientsApisService);

  loading = false;

  patientForm: FormGroup;

  constructor() {
    this.patientForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      gender: ['', Validators.required],
      referring_physician: [''],
      phone_number: [''],
      email: ['', [Validators.email, Validators.required]],
      address: [''],
    });
  }

  isInvalid(field: string): boolean {
    const c = this.patientForm.get(field);
    return !!(c && c.invalid && c.touched);
  }

  goToPatients() {
    this.router.navigate(['patients']);
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.patientsApisService.createPatient(this.patientForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/patients']);
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
