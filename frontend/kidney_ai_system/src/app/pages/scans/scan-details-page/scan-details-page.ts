import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { recentActivityI } from '../../home/interfaces/stats.interface';
import { ScansApisService } from '../scans-apis-service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PatientsApisService } from '../../patients/patients-apis-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';

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

  downloadReport(): void {
    const scan = this.scan();
    if (!scan) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 0;

    // ── Helpers ─────────────────────────────────────────────
    const hex = (h: string) => {
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b = parseInt(h.slice(5, 7), 16);
      return [r, g, b] as [number, number, number];
    };

    // ── Header bar ───────────────────────────────────────────
    doc.setFillColor(...hex('#0f172a'));
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text('Medical Scan Report', margin, 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 190, 210);
    doc.text(`Generated: ${new Date().toLocaleString('en-US')}`, margin, 21);
    doc.text(`Report ID: SCAN-${scan.id}`, pageW - margin, 21, { align: 'right' });

    y = 36;

    // ── Section helper ────────────────────────────────────────
    const sectionTitle = (title: string) => {
      doc.setFillColor(...hex('#f1f5f9'));
      doc.roundedRect(margin, y, contentW, 8, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...hex('#64748b'));
      doc.text(title.toUpperCase(), margin + 4, y + 5.2);
      y += 12;
    };

    const row = (label: string, value: string, isLast = false) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...hex('#475569'));
      doc.text(label, margin + 2, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hex('#0f172a'));
      doc.text(value || '—', margin + contentW * 0.45, y);

      if (!isLast) {
        doc.setDrawColor(...hex('#e2e8f0'));
        doc.line(margin, y + 2.5, margin + contentW, y + 2.5);
      }
      y += 9;
    };

    // ── Patient Information ───────────────────────────────────
    sectionTitle('Patient Information');

    const p = scan.patient;
    if (p) {
      row('Full Name', `${p.first_name} ${p.last_name}`);
      row(
        'Date of Birth',
        p.date_of_birth
          ? new Date(p.date_of_birth).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : '—',
      );
      row('Phone', p.phone_number || '—');
      row('Email', p.email || '—', true);
    } else {
      row('Patient ID', String(scan.patient_id), true);
    }

    y += 6;

    // ── Scan Details ──────────────────────────────────────────
    sectionTitle('Scan Details');

    row('Scan ID', String(scan.id));
    row('Scan Date', this.formattedDate);
    row('Scan Time', this.formattedTime);
    row('Image File', this.fileName, true);

    y += 6;

    // ── AI Analysis ───────────────────────────────────────────
    sectionTitle('AI Analysis');

    row('AI Prediction', scan.ai_prediction);
    row('Status', scan.status);
    row(
      'Confidence Score',
      `${scan.confidence_score?.toFixed(2)}%  (${this.confidenceLabel})`,
      true,
    );

    y += 6;

    // ── Confidence visual bar ─────────────────────────────────
    const barX = margin;
    const barW = contentW;
    const barH = 6;
    doc.setFillColor(...hex('#e2e8f0'));
    doc.roundedRect(barX, y, barW, barH, 3, 3, 'F');

    const fillW = (scan?.confidence_score! / 100) * barW;
    const barColor = this.confidenceColor;
    doc.setFillColor(...hex(barColor));
    doc.roundedRect(barX, y, fillW, barH, 3, 3, 'F');

    y += 14;

    // ── Clinician Note ────────────────────────────────────────
    sectionTitle('Clinician Note');

    const note = this.scanNote().trim() || 'No clinician note recorded.';
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...hex('#374151'));

    const lines = doc.splitTextToSize(note, contentW - 4);
    const noteBoxH = lines.length * 5.5 + 10;
    doc.setFillColor(...hex('#f8fafc'));
    doc.setDrawColor(...hex('#e2e8f0'));
    doc.roundedRect(margin, y, contentW, noteBoxH, 3, 3, 'FD');
    doc.text(lines, margin + 4, y + 7);
    y += noteBoxH + 8;

    // ── Footer ────────────────────────────────────────────────
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(...hex('#f1f5f9'));
    doc.rect(0, pageH - 14, pageW, 14, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...hex('#94a3b8'));
    doc.text(
      'This report is generated automatically and is intended for clinical use only.',
      pageW / 2,
      pageH - 6,
      { align: 'center' },
    );

    // ── Save ──────────────────────────────────────────────────
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-report-${scan.id}-patient-${scan.patient_id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
