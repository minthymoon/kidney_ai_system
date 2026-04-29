import { Routes } from '@angular/router';
import { Layout } from './pages/layout/layout';
import { Home } from './pages/home/home';
import { AllPatients } from './pages/patients/all-patients/all-patients';
import { CreatePatient } from './pages/patients/create-patient/create-patient';
import { PatientProfile } from './pages/patients/patient-profile/patient-profile';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'home', component: Home, title: 'dashboard' },
      { path: 'patients', component: AllPatients, title: 'All Patients' },
      { path: 'create-patient', component: CreatePatient, title: 'create patient' },
      { path: 'patient-profile/:patientID', component: PatientProfile, title: 'patient profile' },
    ],
  },
];
