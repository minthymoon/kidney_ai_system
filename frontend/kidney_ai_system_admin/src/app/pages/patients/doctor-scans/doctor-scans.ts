import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { DoctorOverviewI } from '../interfaces/find-all-doctors.interface';
import { PatientsApisService } from '../patients-apis-service';

@Component({
  selector: 'app-doctor-scans',
  imports: [DecimalPipe, DatePipe, TitleCasePipe],
  templateUrl: './doctor-scans.html',
  styleUrl: './doctor-scans.css',
})
export class DoctorScans implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly patientsApisService = inject(PatientsApisService);
  private destroyRef = inject(DestroyRef);

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
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getConfidenceClass(score: number): string {
    if (score >= 75) return 'conf-high';
    if (score >= 40) return 'conf-medium';
    return 'conf-low';
  }
}
