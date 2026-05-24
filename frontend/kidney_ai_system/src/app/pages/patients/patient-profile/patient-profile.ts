import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientI } from '../interfaces/patients.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PatientsApisService } from '../patients-apis-service';
import { FindAllPatientsResponseI } from '../interfaces/find-all-patients-response.interface';
import { recentActivityI } from '../../home/interfaces/stats.interface';

@Component({
  selector: 'app-patient-profile',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.css',
})
export class PatientProfile implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientsApisService = inject(PatientsApisService);

  private destroyRef = inject(DestroyRef);

  private readonly PAGE_SIZE = 5;
  activeTab: 'scans' | 'demographics' = 'scans';
  searchQuery = '';

  patientID = signal<string>('');
  patientRes = signal<PatientI | null>(null);

  patient = signal<FindAllPatientsResponseI | null>(null);

  currentPage = signal(1);

  allScans = signal<recentActivityI[]>([]);

  filteredScans = computed(() => {
    const filtered = this.allScans();

    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return filtered.slice(start, start + this.PAGE_SIZE);
  });

  totalEntries = computed(() => this.allScans.length);

  totalPages = computed(() => Math.max(1, Math.ceil(this.allScans.length / this.PAGE_SIZE)));

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  entriesStart = computed(() =>
    Math.min((this.currentPage() - 1) * this.PAGE_SIZE + 1, this.totalEntries()),
  );

  entriesEnd = computed(() => Math.min(this.currentPage() * this.PAGE_SIZE, this.totalEntries()));

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

  goToUpdate() {
    this.router.navigate([`update-patient/${this.patient()?.id!}`]);
  }

  findOnePatient(patientID: string) {
    this.patientsApisService.findOnePatient(patientID).subscribe({
      next: (findOneResponse) => {
        this.patient.set(findOneResponse.data);
        this.allScans.set(findOneResponse.data.records);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getInitials(name: string): string {
    return name?.toUpperCase().slice(0, 2);
  }

  createScan() {
    this.router.navigate([`scan-page/${this.patient()?.id!}`]);
  }

  seeDetails(scanID: number) {
    this.router.navigate([`scan-details-page/${scanID}`]);
  }

  goBack(): void {
    window.history.back();
  }
}
