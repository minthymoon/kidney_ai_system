import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { recentActivityI } from '../../home/interfaces/stats.interface';
import { ScansApisService } from '../scans-apis-service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PatientsApisService } from '../../patients/patients-apis-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-scan-details-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './scan-details-page.html',
  styleUrl: './scan-details-page.css',
})
export class ScanDetailsPage implements OnInit {
  private readonly scansApisService = inject(ScansApisService);
  private readonly patientsApisService = inject(PatientsApisService);
  private readonly route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);

  scan = signal<recentActivityI | null>(null);
  scanID = signal<string>('');
  imageUrl = signal<SafeResourceUrl | null>(null);
  scanNote = signal('');

  imageError = false;
  confidenceWidth = '0%';
  canSubmitNote = computed(
    () => !!this.scan() && this.scanNote().trim().length > 0 && !this.isSubmittingNote(),
  );

  isSubmittingNote = signal(false);
  noteError = signal<string | null>(null);

  get formattedDate(): string {
    const date = new Date(this.scan()?.scan_date!);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get formattedTime(): string {
    const date = new Date(this.scan()?.scan_date!);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get fileName(): string {
    return this.scan()?.image_url.split('/').pop() || this.scan()?.image_url!;
  }

  get confidenceLabel(): string {
    const score = this.scan()?.confidence_score || 0;
    if (score >= 95) return 'very high confidence';
    if (score >= 80) return 'high confidence';
    if (score >= 60) return 'moderate confidence';
    return 'low confidence';
  }

  get confidenceColor(): string {
    const score = this.scan()?.confidence_score || 0;
    if (score >= 95) return '#1D9E75';
    if (score >= 80) return '#3B6D11';
    if (score >= 60) return '#BA7517';
    return '#A32D2D';
  }

  ngOnInit(): void {
    this.getScanFromRoute();
  }

  getScanFromRoute() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
      const scanID = paramMap.get('scanID');
      if (!scanID) {
        console.error('No scan ID provided in route');
      } else {
        this.scanID.set(scanID);
        this.findOneScan(scanID);
      }
    });
  }

  findOneScan(scanID: string) {
    this.scansApisService.findOneScan(scanID).subscribe({
      next: (findOneResponse) => {
        this.scan.set(findOneResponse.data);
        this.scanNote.set(findOneResponse.data.doctor_notes || '');

        this.confidenceWidth = `${this.scan()?.confidence_score || 0}%`;
        this.imageUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.scan()?.image_url!));
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  submitNote(): void {
    const result = this.scan();
    if (!result) return;

    this.isSubmittingNote.set(true);
    this.noteError.set(null);

    this.patientsApisService.updateNotesOnScan(+result.id, this.scanNote()).subscribe({
      next: () => {
        this.isSubmittingNote.set(false);
      },
      error: (err) => {
        console.error(err);
        this.noteError.set('Failed to save note. Please try again.');
        this.isSubmittingNote.set(false);
      },
    });
  }

  confirmDelete() {
    if (confirm('Are you sure you want to delete this scan?')) {
      this.scansApisService.deleteScan(this.scanID()).subscribe({
        next: () => {
          console.log('Scan deleted successfully');
          this.goBack();
        },
        error: (err) => {
          console.error('Error deleting scan:', err);
        },
      });
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  goBack(): void {
    window.history.back();
  }
}
