import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { PatientsApisService } from '../patients-apis-service';

@Component({
  selector: 'app-delete-doctor-dialog',
  imports: [CommonModule, RouterModule],
  templateUrl: './delete-doctor-dialog.html',
  styleUrl: './delete-doctor-dialog.css',
})
export class DeleteDoctorDialog implements OnInit {
  private router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly patientsApisService = inject(PatientsApisService);

  private destroyRef = inject(DestroyRef);

  doctorID = signal<string | null>(null);
  isDeleting = false;
  isDeleted = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.getDoctorIDFromRoute();
  }

  getDoctorIDFromRoute() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
      const doctorID = paramMap.get('doctorID');
      if (!doctorID) {
        console.error('No doctor ID provided in route');
      } else {
        this.doctorID.set(doctorID);
      }
    });
  }

  confirmDelete(): void {
    if (!this.doctorID()) return;

    this.isDeleting = true;
    this.errorMessage = null;

    this.patientsApisService.deleteDoctor(this.doctorID()!).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleted = true;
        setTimeout(() => this.router.navigate(['/patients']), 2000);
      },
      error: (err) => {
        this.isDeleting = false;
        this.errorMessage =
          err?.error?.message ?? 'An error occurred while deleting the doctor. Please try again.';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/patients']);
  }
}
