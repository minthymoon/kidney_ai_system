import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AdminsApisService } from '../admins-apis-service';

@Component({
  selector: 'app-delete-admin',
  imports: [CommonModule, RouterModule],
  templateUrl: './delete-admin.html',
  styleUrl: './delete-admin.css',
})
export class DeleteAdmin implements OnInit {
  private router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly adminsApisService = inject(AdminsApisService);

  private destroyRef = inject(DestroyRef);

  adminID = signal<string | null>(null);
  isDeleting = false;
  isDeleted = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.getAdminIDFromRoute();
  }

  getAdminIDFromRoute() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
      const adminID = paramMap.get('adminID');
      if (!adminID) {
        console.error('No admin ID provided in route');
      } else {
        this.adminID.set(adminID);
      }
    });
  }

  confirmDelete(): void {
    if (!this.adminID()) return;

    this.isDeleting = true;
    this.errorMessage = null;

    this.adminsApisService.deleteAdmin(this.adminID()!).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleted = true;
        setTimeout(() => this.router.navigate(['/admins']), 2000);
      },
      error: (err) => {
        this.isDeleting = false;
        this.errorMessage =
          err?.error?.message ?? 'An error occurred while deleting the admin. Please try again.';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admins']);
  }
}
