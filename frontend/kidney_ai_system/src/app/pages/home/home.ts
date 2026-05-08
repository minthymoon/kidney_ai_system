import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HomeApisService } from './home-apis-service';
import { recentActivityI } from './interfaces/stats.interface';

@Component({
  selector: 'app-home',
  imports: [CommonModule, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly homeApisService = inject(HomeApisService);

  stats = [
    {
      label: 'Total Patients',
      value: 4821,
      changeType: 'positive',
      icon: 'patients',
      accent: 'teal',
    },
    {
      label: 'Total Scans',
      value: 18374,
      changeType: 'neutral',
      icon: 'scans',
      accent: 'blue',
    },
    {
      label: 'Pending Scans',
      value: 37,
      changeType: 'warning',
      icon: 'pending',
      accent: 'amber',
    },
  ];

  currentPage = signal(1);
  total_patients = signal(0);
  total_scans = signal(0);
  pending_scans = signal(0);

  allScans = signal<recentActivityI[]>([]);

  ngOnInit(): void {
    this.findAllStats();
  }

  findAllStats() {
    this.homeApisService.findAllStats().subscribe({
      next: (response) => {
        this.total_patients.set(response.data.stats.total_patients);
        this.total_scans.set(response.data.stats.total_scans);
        this.pending_scans.set(response.data.stats.pending_scans);
        this.allScans.set(response.data.recent_activity);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  // filteredScans = computed(() => {
  //   const q = this.searchQuery.toLowerCase();
  //   const filtered = q
  //     ? this.allScans.filter(
  //         (s) =>
  //           s.type.toLowerCase().includes(q) ||
  //           s.status.toLowerCase().includes(q) ||
  //           s.finding.toLowerCase().includes(q),
  //       )
  //     : this.allScans;

  //   const start = (this.currentPage() - 1) * this.PAGE_SIZE;
  //   return filtered.slice(start, start + this.PAGE_SIZE);
  // });
}
