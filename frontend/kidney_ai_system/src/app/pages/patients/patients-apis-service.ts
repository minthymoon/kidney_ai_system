import { inject, Injectable } from '@angular/core';
import { Apis } from '../../core/services/apis/apis';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { FilterPatientsDto } from './dtos/filter-patients.dto';
import { PatientI } from './interfaces/patients.interface';

@Injectable({
  providedIn: 'root',
})
export class PatientsApisService {
  private readonly apis = inject(Apis);

  createPatient(createPatientDto: CreatePatientDto) {
    return this.apis.post('patients', createPatientDto);
  }

  findAllPatients(filterPatientsDto?: FilterPatientsDto) {
    return this.apis.get('patients', filterPatientsDto);
  }

  findOnePatient(patientID: string) {
    return this.apis.get<PatientI>(`patients/${patientID}`);
  }
}
