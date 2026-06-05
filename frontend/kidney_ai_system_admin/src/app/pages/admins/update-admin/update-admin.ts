import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminsApisService } from '../admins-apis-service';
import { AdminOverviewI } from '../interfaces/admin-overview.interface';

@Component({
  selector: 'app-update-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './update-admin.html',
  styleUrl: './update-admin.css',
})
export class UpdateAdmin implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly adminsApisService = inject(AdminsApisService);

  private destroyRef = inject(DestroyRef);

  firstName = signal<string>('');
  lastName: string = '';
  email: string = '';
  username: string = '';
  phone_number: string = '';

  isLoading: boolean = false;

  adminID = signal<string | null>(null);
  admin = signal<AdminOverviewI | null>(null);

  ngOnInit(): void {
    this.getAdminFromRoute();
  }

  getAdminFromRoute() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
      const adminID = paramMap.get('adminID');
      if (!adminID) {
        console.error('No admin ID provided in route');
      } else {
        this.adminID.set(adminID);
        this.findOneAdmin();
      }
    });
  }

  findOneAdmin() {
    if (!this.adminID()) return;
    this.adminsApisService.findOneAdmin(this.adminID()!).subscribe({
      next: (res) => {
        this.admin.set(res.data);
        this.firstName.set(res.data.first_name!);
        this.lastName = res.data.last_name!;
        this.email = res.data.email!;
        this.username = res.data.username!;
        this.phone_number = res.data.phone_number!;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  get formValid(): boolean {
    return (
      this.firstName().trim().length > 0 &&
      this.lastName.trim().length > 0 &&
      this.email.trim().length > 0 &&
      this.username.trim().length > 0 &&
      this.phone_number.trim().length > 0
    );
  }

  onSubmit(): void {
    if (!this.formValid) return;
    this.isLoading = true;

    this.adminsApisService
      .updateAdmin(this.adminID()!, {
        first_name: this.firstName(),
        last_name: this.lastName,
        email: this.email,
        username: this.username,
        phone_number: this.phone_number,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['admins']);
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['admins']);
  }
}
