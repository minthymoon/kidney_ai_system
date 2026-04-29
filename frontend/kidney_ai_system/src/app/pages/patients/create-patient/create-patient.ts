import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-patient',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-patient.html',
  styleUrl: './create-patient.css',
})
export class CreatePatient {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  loading = false;

  patientForm: FormGroup;

  constructor() // private patientService: PatientService,
  {
    this.patientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      sex: ['', Validators.required],
      patientId: ['', Validators.required],
      referringPhysician: [''],
      phone: [''],
      email: ['', Validators.email],
      address: [''],
      notes: [''],
      consent: [false, Validators.requiredTrue],
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

    // this.patientService.addPatient(this.patientForm.value).subscribe({
    //   next: () => {
    //     this.loading = false;
    //     this.router.navigate(['/patients']);
    //   },
    //   error: () => {
    //     this.loading = false;
    //   },
    // });
  }
}
