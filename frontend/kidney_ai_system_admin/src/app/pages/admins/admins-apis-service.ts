import { inject, Injectable } from '@angular/core';
import { Apis } from '../../core/services/apis/apis';
import { FilterPatientsDto } from '../patients/dtos/filter-patients.dto';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { AdminOverviewI } from './interfaces/admin-overview.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminsApisService {
  private readonly apis = inject(Apis);

  //admin/dashboard/scan-distribution

  findAllAdmins(filterPatientsDto?: FilterPatientsDto) {
    return this.apis.get<AdminOverviewI[]>('admin/admins-overview', filterPatientsDto);
  }

  findOneAdmin(adminID: string) {
    return this.apis.get<AdminOverviewI>(`admin/admins/${adminID}`);
  }

  createAdmin(createAdminDto: CreateAdminDto) {
    return this.apis.post('admin/create-admin', createAdminDto);
  }

  updateAdmin(adminID: string, updateAdminDto: CreateAdminDto) {
    return this.apis.patch(`admin/edit-admin/${adminID}`, updateAdminDto);
  }

  deleteAdmin(adminID: string) {
    return this.apis.delete(`admin/delete-admin/${adminID}`);
  }
}
