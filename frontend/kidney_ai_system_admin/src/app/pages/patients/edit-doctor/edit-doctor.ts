import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsApisService } from '../patients-apis-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DoctorOverviewI } from '../interfaces/find-all-doctors.interface';

@Component({
  selector: 'app-edit-doctor',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-doctor.html',
  styleUrl: './edit-doctor.css',
})
export class EditDoctor implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly patientsApisService = inject(PatientsApisService);

  private destroyRef = inject(DestroyRef);

  firstName = signal<string>('');
  lastName: string = '';
  email: string = '';
  username: string = '';
  phone_number: string = '';

  isLoading: boolean = false;

  doctorID = signal<string | null>(null);
  doctor = signal<DoctorOverviewI | null>(null);

  ngOnInit(): void {
    this.getDoctorFromRoute();
  }

  getDoctorFromRoute() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
      const doctorID = paramMap.get('doctorID');
      if (!doctorID) {
        console.error('No doctor ID provided in route');
      } else {
        this.doctorID.set(doctorID);
        this.findOneDoctor();
      }
    });
  }

  findOneDoctor() {
    if (!this.doctorID()) return;
    this.patientsApisService.findOneDoctor(this.doctorID()!).subscribe({
      next: (res) => {
        this.doctor.set(res.data);
        this.firstName.set(res.data.first_name!);
        this.lastName = res.data.last_name!;
        this.email = res.data.email!;
        this.username = res.data.username!;
        this.phone_number = res.data.phone_number!;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  get formValid(): boolean {
    return (
      this.firstName().trim().length > 0 &&
      this.lastName.trim().length > 0 &&
      this.email.trim().length > 0 &&
      this.username.trim().length > 0 &&
      this.phone_number.trim().length > 0
    );
  }

  onSubmit(): void {
    if (!this.formValid) return;
    this.isLoading = true;

    this.patientsApisService
      .updateDoctor(this.doctorID()!, {
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        username: this.username,
        phone_number: this.phone_number,
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
