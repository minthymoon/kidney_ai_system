import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PatientsApisService } from '../patients-apis-service';
import { DoctorOverviewI } from '../interfaces/find-all-doctors.interface';

@Component({
  selector: 'app-all-patients',
  imports: [],
  templateUrl: './all-patients.html',
  styleUrl: './all-patients.css',
})
export class AllPatients implements OnInit {
  private readonly router = inject(Router);
  private readonly doctorsApisService = inject(PatientsApisService);

  doctors = signal<DoctorOverviewI[]>([]);

  pageSize = 8;
  currentPage = signal(1);
  searchQuery = signal('');

  filteredDoctors = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.doctors();
    return this.doctors().filter((d) => d.username.toLowerCase().includes(query));
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredDoctors().length / this.pageSize)),
  );

  paginatedDoctors = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredDoctors().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.findAllDoctors();
  }

  findAllDoctors() {
    this.doctorsApisService.findAllPatients().subscribe({
      next: (response) => {
        this.doctors.set(response.data);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  viewScans(doctor: DoctorOverviewI) {
    this.router.navigate([`doctor-scans/${doctor.doctor_id}`]);
  }

  editDoctor(doctor: DoctorOverviewI) {
    this.router.navigate([`edit-doctor/${doctor.doctor_id}`]);
  }

  deleteDoctor(doctor: DoctorOverviewI) {
    console.log('Delete doctor', doctor.doctor_id);
  }

  goToCreateDoctor() {
    this.router.navigate(['create-doctor']);
  }
}
