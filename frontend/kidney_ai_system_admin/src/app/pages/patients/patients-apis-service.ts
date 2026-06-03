import { inject, Injectable } from '@angular/core';
import { Apis } from '../../core/services/apis/apis';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { FilterPatientsDto } from './dtos/filter-patients.dto';
import { DoctorOverviewI } from './interfaces/find-all-doctors.interface';
import { SignupDto } from '../auth/dtos/signup.dto';

@Injectable({
  providedIn: 'root',
})
export class PatientsApisService {
  private readonly apis = inject(Apis);

  signup(signupDto: SignupDto) {
    return this.apis.post('signup', signupDto);
  }

  updateDoctor(doctorID: string, createDoctorDto: CreatePatientDto) {
    return this.apis.patch(`admin/edit-doctor/${doctorID}`, createDoctorDto);
  }

  findAllPatients(filterPatientsDto?: FilterPatientsDto) {
    return this.apis.get<DoctorOverviewI[]>('admin/doctors-overview', filterPatientsDto);
  }

  findOneDoctor(doctorID: string) {
    return this.apis.get<DoctorOverviewI>(`admin/doctors/${doctorID}`);
  }

  deleteDoctor(doctorID: string) {
    return this.apis.delete(`admin/delete-doctor/${doctorID}`);
  }
}
