import { inject, Injectable } from '@angular/core';
import { Apis } from '../../core/services/apis/apis';
import { CreatePatientDto } from './dtos/create-patient.dto';
import { FilterPatientsDto } from './dtos/filter-patients.dto';
import { FindAllPatientsResponseI } from './interfaces/find-all-patients-response.interface';
import { CreateScanDto } from './dtos/create-scan.dto';
import { ScanResponseI } from './interfaces/scan-response.interface';

@Injectable({
  providedIn: 'root',
})
export class PatientsApisService {
  private readonly apis = inject(Apis);

  createPatient(createPatientDto: CreatePatientDto) {
    return this.apis.post('patients', createPatientDto);
  }

  createScan(createScanDto: CreateScanDto) {
    return this.apis.post<ScanResponseI>('analysis/predict-image', createScanDto);
  }

  updatePatient(patientID: string, createPatientDto: CreatePatientDto) {
    return this.apis.patch(`patients/${patientID}`, createPatientDto);
  }

  findAllPatients(filterPatientsDto?: FilterPatientsDto) {
    return this.apis.get<FindAllPatientsResponseI[]>('patients', filterPatientsDto);
  }

  findOnePatient(patientID: string) {
    return this.apis.get<FindAllPatientsResponseI>(`patients/${patientID}`);
  }
}
