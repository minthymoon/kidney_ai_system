import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScanResponseI } from '../../patients/interfaces/scan-response.interface';
import { PatientsApisService } from '../../patients/patients-apis-service';

@Component({
  selector: 'app-quick-scan-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-scan-page.html',
  styleUrl: './quick-scan-page.css',
})
export class QuickScanPage {
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly patientsApisService = inject(PatientsApisService);

  // Upload state
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isDragOver = signal(false);
  uploadProgress = signal(0);

  // Request state
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Result state
  scanResult = signal<ScanResponseI | null>(null);

  // Computed helpers
  canSubmit = computed(() => !!this.selectedFile() && !this.isLoading());

  /** Human-readable severity label */
  severityLabel(severity: string): string {
    const map: Record<string, string> = {
      normal: 'Normal',
      mild: 'Mild',
      moderate: 'Moderate',
      severe: 'Severe',
    };
    return map[severity] ?? severity;
  }

  // ── File handling ──────────────────────────────────────────────

  triggerFileInput(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  processFile(file: File): void {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.type) && !file.name.endsWith('.dcm')) {
      this.error.set('Please upload a valid file (JPEG, PNG, WEBP, or DICOM).');
      return;
    }
    this.selectedFile.set(file);
    this.error.set(null);
    this.scanResult.set(null);
    this.uploadProgress.set(0);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.previewUrl.set(null);
    }
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.scanResult.set(null);
    this.error.set(null);
    this.uploadProgress.set(0);
    const input = this.fileInput()?.nativeElement;
    if (input) input.value = '';
  }

  // ── Submission ─────────────────────────────────────────────────

  submitScan(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.uploadProgress.set(0);

    const formData = new FormData();
    formData.append('file', file);

    this.patientsApisService.createScan(formData).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.scanResult.set(response.data);
          this.isLoading.set(false);
        }, 1000);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    window.history.back();
  }
}
