import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { StorageService } from '../../../core/services/storage/storage';

@Component({
  selector: 'app-navbar',
  imports: [RouterLinkActive, RouterLink, NgClass],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);

  isDropdownOpen = false;
  isMobileMenuOpen = false;
  userEmail = signal<string | null>(null);
  userName = signal<string | null>(null);
  userRole = signal<number | null>(null);

  ngOnInit(): void {
    const email = this.getEmailFromToken(this.storageService.accessToken!);
    const name = this.getNameFromToken(this.storageService.accessToken!);
    const role = this.getRoleFromToken(this.storageService.accessToken!);
    this.userEmail.set(email);
    this.userName.set(name);
    this.userRole.set(+role!);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getEmailFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.email ?? null;
    } catch {
      return null;
    }
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

  getNameFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.name ?? null;
    } catch {
      return null;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onProfile(): void {
    this.router.navigate(['profile']);
    this.isDropdownOpen = false;
  }

  onLogout(): void {
    this.storageService.loggedInUser = null;
    this.storageService.accessToken = null;
    this.storageService.refreshToken = null;

    this.isDropdownOpen = false;
    this.router.navigate(['auth/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isDropdownOpen = false;
    }
  }
}
