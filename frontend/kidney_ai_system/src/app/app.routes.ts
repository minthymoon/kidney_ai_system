import { Routes } from '@angular/router';
import { Layout } from './pages/layout/layout';
import { Home } from './pages/home/home';
import { AllPatients } from './pages/patients/all-patients/all-patients';
import { CreatePatient } from './pages/patients/create-patient/create-patient';
import { PatientProfile } from './pages/patients/patient-profile/patient-profile';
import { Login } from './pages/auth/login/login';
import { Signup } from './pages/auth/signup/signup';
import { UpdatePatient } from './pages/patients/update-patient/update-patient';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: 'home', component: Home, title: 'dashboard' },
      { path: 'patients', component: AllPatients, title: 'All Patients' },
      { path: 'create-patient', component: CreatePatient, title: 'create patient' },
      { path: 'update-patient/:patientID', component: UpdatePatient, title: 'update patient' },
      { path: 'patient-profile/:patientID', component: PatientProfile, title: 'patient profile' },
    ],
  },
  { path: 'auth/login', component: Login, title: 'Login' },
  { path: 'auth/signup', component: Signup, title: 'Sign up' },
  { path: '**', redirectTo: 'home' },
];
