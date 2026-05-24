import { Routes } from '@angular/router';
import { Layout } from './pages/layout/layout';
import { Home } from './pages/home/home';
import { AllPatients } from './pages/patients/all-patients/all-patients';
import { CreatePatient } from './pages/patients/create-patient/create-patient';
import { Login } from './pages/auth/login/login';
import { Signup } from './pages/auth/signup/signup';
import { authenticationGuard } from './core/guards/authentication-guard';
import { NotFound } from './pages/error-pages/not-found/not-found';
import { Unauthorized } from './pages/error-pages/unauthorized/unauthorized';
import { Profile } from './pages/profile/profile';
import { ScanDetailsPage } from './pages/scans/scan-details-page/scan-details-page';
import { AllScans } from './pages/scans/all-scans/all-scans';
import { AllAdmins } from './pages/admins/all-admins/all-admins';
import { CreateAdmin } from './pages/admins/create-admin/create-admin';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    canActivate: [authenticationGuard],
    children: [
      { path: 'home', component: Home, title: 'Dashboard' },
      { path: 'scans', component: AllScans, title: 'All Scans' },
      { path: 'profile', component: Profile, title: 'Profile' },
      { path: 'patients', component: AllPatients, title: 'All Patients' },
      { path: 'create-doctor', component: CreatePatient, title: 'Create Doctor' },
      { path: 'scan-details-page/:scanID', component: ScanDetailsPage, title: 'Scan details page' },
      { path: 'admins', component: AllAdmins, title: 'All Admins' },
      { path: 'create-admin', component: CreateAdmin, title: 'Create Admin' },
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
