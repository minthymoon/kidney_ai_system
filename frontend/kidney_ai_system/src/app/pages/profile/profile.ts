import { NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserProfile } from './interfaces/user-profile.interface';
import { StorageService } from '../../core/services/storage/storage';
import { ProfileApisService } from './profile-apis-service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, NgClass],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly storageService = inject(StorageService);
  private readonly profileApisService = inject(ProfileApisService);

  isEditing = false;
  isSaving = false;
  saveSuccess = false;

  userID = signal<string | null>(null);
  profile = signal<UserProfile | null>(null);

  draft: UserProfile = this.emptyDraft();

  ngOnInit(): void {
    this.userID.set(this.storageService.accessToken!);
    this.profileApisService.getLoggedInUser().subscribe({
      next: (response) => {
        this.profile.set(response.data);
        this.draft = { ...response.data };
      },
      error: (err) => console.error(err),
    });
  }

  getIdFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id ?? decoded.sub ?? null;
    } catch {
      return null;
    }
  }

  startEditing(): void {
    this.draft = { ...(this.profile() ?? this.emptyDraft()) };
    this.isEditing = true;
    this.saveSuccess = false;
  }

  cancelEditing(): void {
    this.draft = { ...(this.profile() ?? this.emptyDraft()) };
    this.isEditing = false;
  }

  saveChanges(): void {
    if (!this.userID()) return;
    this.isSaving = true;

    this.profileApisService.updateLoggedInUser(this.draft).subscribe({
      next: (response) => {
        this.profile.set(response.data);
        this.isSaving = false;
        this.isEditing = false;
        this.saveSuccess = true;
        setTimeout(() => (this.saveSuccess = false), 3000);
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
      },
    });
  }

  get initials(): string {
    return (
      (this.profile()?.first_name?.[0] ?? '') + (this.profile()?.last_name?.[0] ?? '')
    ).toUpperCase();
  }

  get fullName(): string {
    return `${this.profile()?.first_name ?? ''} ${this.profile()?.last_name ?? ''}`.trim();
  }

  private emptyDraft(): UserProfile {
    return {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    };
  }
}
