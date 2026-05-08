import { Routes } from '@angular/router';
import { Layout } from './pages/layout/layout';
import { Home } from './pages/home/home';
import { AllPatients } from './pages/patients/all-patients/all-patients';
import { CreatePatient } from './pages/patients/create-patient/create-patient';
import { PatientProfile } from './pages/patients/patient-profile/patient-profile';
import { Login } from './pages/auth/login/login';
import { Signup } from './pages/auth/signup/signup';
import { UpdatePatient } from './pages/patients/update-patient/update-patient';
import { authenticationGuard } from './core/guards/authentication-guard';
import { NotFound } from './pages/error-pages/not-found/not-found';
import { Unauthorized } from './pages/error-pages/unauthorized/unauthorized';
import { Profile } from './pages/profile/profile';
import { ScanPage } from './pages/patients/scan-page/scan-page';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authenticationGuard],
    children: [
      { path: 'home', component: Home, title: 'Dashboard' },
      { path: 'profile', component: Profile, title: 'Profile' },
      { path: 'patients', component: AllPatients, title: 'All Patients' },
      { path: 'create-patient', component: CreatePatient, title: 'Create patient' },
      { path: 'update-patient/:patientID', component: UpdatePatient, title: 'Update patient' },
      { path: 'patient-profile/:patientID', component: PatientProfile, title: 'Patient profile' },
      { path: 'scan-page/:patientID', component: ScanPage, title: 'Scan page' },
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: Login,
        title: 'Login',
      },
      {
        path: 'signup',
        component: Signup,
        title: 'Sign up',
      },
    ],
  },
  {
    path: 'errors',
    children: [{ path: 'unauthorized', component: Unauthorized }],
  },
  { path: '**', component: NotFound },
];
