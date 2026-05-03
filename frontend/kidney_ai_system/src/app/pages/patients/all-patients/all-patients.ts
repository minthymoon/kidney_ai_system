import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PatientsApisService } from '../patients-apis-service';
import { FindAllPatientsResponseI } from '../interfaces/find-all-patients-response.interface';

@Component({
  selector: 'app-all-patients',
  imports: [],
  templateUrl: './all-patients.html',
  styleUrl: './all-patients.css',
})
export class AllPatients implements OnInit {
  private readonly router = inject(Router);
  private readonly patientsApisService = inject(PatientsApisService);

  patients = signal<FindAllPatientsResponseI[]>([]);

  pageSize = 4;
  currentPage = signal(1);
  searchQuery = signal('');

  filteredPatients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.patients();

    return this.patients().filter(
      (p) => p.first_name.toLowerCase().includes(query) || p.email?.toLowerCase().includes(query),
    );
  });

  totalPages = computed(() => Math.ceil(this.filteredPatients().length / this.pageSize));

  paginatedPatients = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredPatients().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.findAllPatients();
  }

  findAllPatients() {
    this.patientsApisService.findAllPatients().subscribe({
      next: (response) => {
        this.patients.set(response.data);
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

  goToProfile(patient: FindAllPatientsResponseI) {
    this.router.navigate([`patient-profile/${patient.id}`]);
  }

  goToCreatePatient() {
    this.router.navigate(['create-patient']);
  }
}
