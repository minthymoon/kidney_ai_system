import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminsApisService } from '../admins-apis-service';
import { AdminOverviewI } from '../interfaces/admin-overview.interface';

@Component({
  selector: 'app-all-admins',
  imports: [],
  templateUrl: './all-admins.html',
  styleUrl: './all-admins.css',
})
export class AllAdmins implements OnInit {
  private readonly router = inject(Router);
  private readonly adminsApisService = inject(AdminsApisService);

  admins = signal<AdminOverviewI[]>([]);

  pageSize = 8;
  currentPage = signal(1);
  searchQuery = signal('');

  filteredAdmins = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.admins();
    return this.admins().filter(
      (a) => a.username.toLowerCase().includes(query) || a.email?.toLowerCase().includes(query),
    );
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAdmins().length / this.pageSize)));

  paginatedAdmins = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredAdmins().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.findAllAdmins();
  }

  findAllAdmins() {
    this.adminsApisService.findAllAdmins().subscribe({
      next: (response) => {
        this.admins.set(response.data);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  editAdmin(admin: AdminOverviewI) {
    this.router.navigate([`edit-admin/${admin.admin_id}`]);
  }

  deleteAdmin(admin: AdminOverviewI) {
    // Hook into your delete service/confirmation dialog here
    console.log('Delete admin', admin.admin_id);
  }

  goToCreateAdmin() {
    this.router.navigate(['create-admin']);
  }
}
