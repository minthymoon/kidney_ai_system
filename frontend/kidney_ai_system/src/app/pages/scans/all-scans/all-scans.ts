import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScansApisService } from '../scans-apis-service';
import { recentActivityI } from '../../home/interfaces/stats.interface';

@Component({
  selector: 'app-all-scans',
  imports: [FormsModule],
  templateUrl: './all-scans.html',
  styleUrl: './all-scans.css',
})
export class AllScans implements OnInit {
  private readonly router = inject(Router);
  private readonly scansApisService = inject(ScansApisService);

  // Replace this with an HttpClient call to your API
  allScans = signal<recentActivityI[]>([]);

  // Pagination state
  currentPage = 1;
  itemsPerPage = 5;
  imageErrors: { [id: number]: boolean } = {};

  get totalItems(): number {
    return this.allScans().length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginatedScans(): recentActivityI[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.allScans().slice(start, start + this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const delta = 2;
    const left = Math.max(1, this.currentPage - delta);
    const right = Math.min(this.totalPages, this.currentPage + delta);
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }
    return pages;
  }

  get showLeftEllipsis(): boolean {
    return this.pageNumbers[0] > 1;
  }

  get showRightEllipsis(): boolean {
    return this.pageNumbers[this.pageNumbers.length - 1] < this.totalPages;
  }

  ngOnInit(): void {
    this.findAllScans();
  }

  findAllScans() {
    this.scansApisService.findALlScans().subscribe({
      next: (findAllResponse) => {
        this.allScans.set(findAllResponse.data);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  seeDetails(scanID: number) {
    this.router.navigate([`scan-details-page/${scanID}`]);
  }
}
