import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApisService } from '../auth-apis-service';
import { StorageService } from '../../../core/services/storage/storage';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);

  private readonly authApisService = inject(AuthApisService);

  userName: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    if (!this.userName || !this.password) return;
    this.isLoading = true;

    this.authApisService.login({ username: this.userName, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        const role = this.getRoleFromToken(response.data.access_token);
        if (+role! == 2) {
          this.storageService.accessToken = response.data.access_token;
          this.router.navigate(['home']);
        } else {
          alert('Unauthorized: You do not have permission to access this application.');
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  getRoleFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.role ?? null;
    } catch {
      return null;
    }
  }

  onCreateAccount(): void {
    this.router.navigate(['auth/signup']);
  }
}
