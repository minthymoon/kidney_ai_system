import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ScanI } from '../interfaces/scan.interface';
import { PatientI } from '../interfaces/patients.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PatientsApisService } from '../patients-apis-service';

@Component({
  selector: 'app-patient-profile',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient-profile.html',
  styleUrl: './patient-profile.css',
})
export class PatientProfile implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly patientsApisService = inject(PatientsApisService);

  private destroyRef = inject(DestroyRef);

  private readonly PAGE_SIZE = 5;
  activeTab: 'scans' | 'demographics' = 'scans';
  searchQuery = '';

  patientID = signal<string>('');
  patientRes = signal<PatientI | null>(null);

  patient: PatientI = {
    id: 1,
    full_name: 'Jane Doe',
    gender: 'Female',
    phone_number: '(555) 012-3456',
    email: 'jane.doe@example.com',
    address: '123 Medical Way, Suite 100, City, State, ZIP',
  };

  currentPage = signal(1);

  private allScans: ScanI[] = [
    {
      id: 1,
      date: 'Oct 12, 2025',
      time: '14:30 PM',
      type: 'Kidney X-Ray (AP)',
      status: 'Completed',
      finding: 'Normal contour, no visible calculi or...',
    },
    {
      id: 2,
      date: 'Sep 28, 2025',
      time: '09:15 AM',
      type: 'Renal Ultrasound',
      status: 'Canceled',
      finding: 'Possible 4mm calculus in lower pol...',
    },
    {
      id: 3,
      date: 'Jul 15, 2025',
      time: '11:00 AM',
      type: 'Kidney X-Ray (AP)',
      status: 'Pending',
      finding: 'Analysis in progress...',
    },
    {
      id: 4,
      date: 'May 03, 2025',
      time: '08:45 AM',
      type: 'Renal Ultrasound',
      status: 'Completed',
      finding: 'No hydronephrosis detected.',
    },
    {
      id: 5,
      date: 'Feb 18, 2025',
      time: '13:00 PM',
      type: 'Kidney X-Ray (AP)',
      status: 'Completed',
      finding: 'Mild cortical thinning noted.',
    },
  ];

  filteredScans = computed(() => {
    const q = this.searchQuery.toLowerCase();
    const filtered = q
      ? this.allScans.filter(
          (s) =>
            s.type.toLowerCase().includes(q) ||
            s.status.toLowerCase().includes(q) ||
            s.finding.toLowerCase().includes(q),
        )
      : this.allScans;

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

  findOnePatient(patientID: string) {
    this.patientsApisService.findOnePatient(patientID).subscribe({
      next: (findOneResponse) => {
        // this.patientRes.set(findOneResponse.data);
        console.log(findOneResponse);
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
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
