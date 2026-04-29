import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PatientI } from '../interfaces/patients.interface';
import { Router } from '@angular/router';
import { PatientsApisService } from '../patients-apis-service';

@Component({
  selector: 'app-all-patients',
  imports: [],
  templateUrl: './all-patients.html',
  styleUrl: './all-patients.css',
})
export class AllPatients implements OnInit {
  private readonly router = inject(Router);
  private readonly patientsApisService = inject(PatientsApisService);

  patients = signal<PatientI[]>([
    {
      id: 1,
      full_name: 'Jane Doe',
      age: 28,
      gender: 'Female',
      phone_number: '0791111111',
      doctor_id: 'D1',
    },
    {
      id: 2,
      full_name: 'Robert Johnson',
      age: 45,
      gender: 'Male',
      phone_number: '0792222222',
      doctor_id: 'D1',
    },
    {
      id: 3,
      full_name: 'Michael Smith',
      age: 36,
      gender: 'Male',
      phone_number: '0793333333',
      doctor_id: 'D2',
    },
    {
      id: 4,
      full_name: 'Amanda Lee',
      age: 50,
      gender: 'Female',
      phone_number: '0794444444',
      doctor_id: 'D2',
    },
    {
      id: 5,
      full_name: 'Ahmad Ali',
      age: 40,
      gender: 'Male',
      phone_number: '0795555555',
      doctor_id: 'D3',
    },
    {
      id: 6,
      full_name: 'Sara Khaled',
      age: 31,
      gender: 'Female',
      phone_number: '0796666666',
      doctor_id: 'D3',
    },
  ]);

  // Pagination
  pageSize = 4;
  currentPage = signal(1);

  totalPages = computed(() => Math.ceil(this.patients().length / this.pageSize));

  paginatedPatients = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.patients().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.findAllPatients();
  }

  findAllPatients() {
    this.patientsApisService.findAllPatients().subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  goToProfile(patient: PatientI) {
    this.router.navigate([`patient-profile/${patient.id}`]);
  }

  goToCreatePatient() {
    this.router.navigate(['create-patient']);
  }
}
