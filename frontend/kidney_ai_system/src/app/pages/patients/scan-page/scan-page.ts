import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PatientsApisService } from '../patients-apis-service';
import { ScanResponseI } from '../interfaces/scan-response.interface';

@Component({
  selector: 'app-scan-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './scan-page.html',
  styleUrl: './scan-page.css',
})
export class ScanPage implements OnInit {
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly route = inject(ActivatedRoute);
  private readonly patientsApisService = inject(PatientsApisService);

  private destroyRef = inject(DestroyRef);

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
  scanNote = signal('');
  patientID = signal('');

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

  ngOnInit(): void {
    this.getPatientFromRoute();
  }

  getPatientFromRoute() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
      const patientID = paramMap.get('patientID');
      if (!patientID) {
        console.error('No patient ID provided in route');
      } else {
        this.patientID.set(patientID);
      }
    });
  }

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
    this.scanNote.set('');
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
    this.scanNote.set('');
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
    formData.append('patient_id', this.patientID());

    this.patientsApisService.createScan(formData).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.scanResult.set(response.data);
          this.isLoading.set(false);
        }, 5000);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }
}
