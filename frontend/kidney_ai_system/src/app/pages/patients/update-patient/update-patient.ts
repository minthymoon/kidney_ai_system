import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientsApisService } from '../patients-apis-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';

@Component({
  selector: 'app-update-patient',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-patient.html',
  styleUrl: './update-patient.css',
})
export class UpdatePatient implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly patientsApisService = inject(PatientsApisService);

  private destroyRef = inject(DestroyRef);

  loading = false;
  loadingPatient = false;
  patientID = signal<string>('');

  patientForm: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    date_of_birth: ['', Validators.required],
    gender: ['', Validators.required],
    referring_physician: [''],
    phone_number: [''],
    email: ['', [Validators.email, Validators.required]],
    address: [''],
  });

  ngOnInit(): void {
    this.getPatientFromRoute();
  }

  getPatientFromRoute() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
      const patientID = paramMap.get('patientID');
      if (!patientID) {
        console.error('No patient ID provided in route');
      } else {
        this.patientID.set(patientID);
        this.findOnePatient(patientID);
      }
    });
  }

  findOnePatient(patientID: string) {
    this.patientsApisService.findOnePatient(patientID).subscribe({
      next: (patient) => {
        this.patientForm.patchValue({
          first_name: patient.data.first_name!,
          last_name: patient.data.last_name,
          date_of_birth: patient.data.date_of_birth?.split('T')[0] ?? '',
          gender: patient.data.gender,
          referring_physician: patient.data.referring_physician ?? '',
          phone_number: patient.data.phone_number ?? '',
          email: patient.data.email,
          address: patient.data.address ?? '',
        });
        this.loadingPatient = false;
      },
      error: () => {
        this.loadingPatient = false;
        this.router.navigate(['/patients']);
      },
    });
  }

  isInvalid(field: string): boolean {
    const c = this.patientForm.get(field);
    return !!(c && c.invalid && c.touched);
  }

  goToPatients(): void {
    this.location.back();
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.patientsApisService.updatePatient(this.patientID(), this.patientForm.value).subscribe({
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
