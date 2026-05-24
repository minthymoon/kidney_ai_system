import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HomeApisService } from './home-apis-service';
import { recentActivityI } from './interfaces/stats.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly homeApisService = inject(HomeApisService);
  private readonly router = inject(Router);

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

  imageErrors: { [id: number]: boolean } = {};

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

  seeDetails(scanID: number) {
    this.router.navigate([`scan-details-page/${scanID}`]);
  }

  onImageError(scanId: number): void {
    this.imageErrors[scanId] = true;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getConfidenceColor(score: number): string {
    if (score >= 95) return '#0f6e56';
    if (score >= 80) return '#185fa5';
    if (score >= 60) return '#ba7517';
    return '#a32d2d';
  }

  getConfidenceBg(score: number): string {
    if (score >= 95) return '#e6f9f0';
    if (score >= 80) return '#e6f0fb';
    if (score >= 60) return '#faeeda';
    return '#fcebeb';
  }
}
