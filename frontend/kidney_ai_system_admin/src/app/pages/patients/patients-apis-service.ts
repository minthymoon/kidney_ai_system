import { inject, Injectable } from '@angular/core';
import { Apis } from '../../core/services/apis/apis';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { FilterPatientsDto } from './dtos/filter-patients.dto';
import { FindAllPatientsResponseI } from './interfaces/find-all-patients-response.interface';
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

  updatePatient(patientID: string, createPatientDto: CreatePatientDto) {
    return this.apis.patch(`patients/${patientID}`, createPatientDto);
  }

  findAllPatients(filterPatientsDto?: FilterPatientsDto) {
    return this.apis.get<DoctorOverviewI[]>('admin/doctors-overview', filterPatientsDto);
  }

  findOnePatient(patientID: string) {
    return this.apis.get<FindAllPatientsResponseI>(`patients/${patientID}`);
  }

  deleteDoctor(doctorID: string) {
    return this.apis.delete(`admin/delete-doctor/${doctorID}`);
  }
}
