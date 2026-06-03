import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { HomeApisService } from './home-apis-service';
import { recentActivityI } from './interfaces/stats.interface';
import { Router } from '@angular/router';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js';

Chart.register(
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
);
@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly homeApisService = inject(HomeApisService);
  private readonly router = inject(Router);

  @ViewChild('diseaseChart')
  diseaseChartRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('trendChart')
  trendChartRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private trendChart?: Chart;

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

        this.createDiseaseChart(response.data.chart_data);

        if (response.data.trend_chart_data?.length) {
          this.createTrendChart(response.data.trend_chart_data);
        }
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

  createDiseaseChart(chartData: { label: string; value: number }[]) {
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = chartData.map((item) => item.label);
    const values = chartData.map((item) => item.value);

    const colors = [
      '#0ea5e9',
      '#14b8a6',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#84cc16',
      '#06b6d4',
    ];

    this.chart = new Chart(this.diseaseChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  createTrendChart(data: { month: string; value: number }[]) {
    if (this.trendChart) {
      this.trendChart.destroy();
    }

    const labels = data.map((d) => d.month);
    const values = data.map((d) => d.value);

    this.trendChart = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Monthly trend',
            data: values,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: '#2563eb',
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} scans`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 12 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { color: '#94a3b8', font: { size: 12 } },
          },
        },
      },
    });
  }
}
