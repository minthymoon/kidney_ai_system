import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { ScanI } from '../patients/interfaces/scan.interface';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  stats = [
    {
      label: 'Total Patients',
      value: 4821,
      change: '+12% this month',
      changeType: 'positive',
      icon: 'patients',
      accent: 'teal',
    },
    {
      label: 'Total Scans',
      value: 18374,
      change: '1,203 this week',
      changeType: 'neutral',
      icon: 'scans',
      accent: 'blue',
    },
    {
      label: 'Pending Scans',
      value: 37,
      change: 'Oldest: 2h ago',
      changeType: 'warning',
      icon: 'pending',
      accent: 'amber',
    },
  ];

  currentPage = signal(1);
  private readonly PAGE_SIZE = 5;
  searchQuery = '';

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
}
