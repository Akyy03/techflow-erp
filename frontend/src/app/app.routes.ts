import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { AdminShell } from './components/layout/admin-shell/admin-shell';
import { EmployeeListComponent } from './components/employee-list/employee-list';

import { authGuard } from './services/auth.guard';
import { guestGuard } from './services/guest.guard';

import { Dashboard } from './components/dashboard/dashboard';
import { Projects } from './components/projects/projects';
import { Leaves } from './components/leaves/leaves';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: AdminShell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'projects', component: Projects },
      { path: 'leaves', component: Leaves },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
