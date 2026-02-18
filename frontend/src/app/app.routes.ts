import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { AdminShell } from './components/layout/admin-shell/admin-shell';
import { EmployeeListComponent } from './components/employee-list/employee-list';
import { SetupPassword } from './auth/setup-password/setup-password';

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
    path: 'setup-password',
    component: SetupPassword,
    canActivate: [authGuard],
  },
  {
    path: '',
    component: AdminShell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'employees', component: EmployeeListComponent },
      {
        path: 'employees/:id',
        loadComponent: () =>
          import('./features/employees/employee-detail/employee-detail').then(
            (m) => m.EmployeeDetailComponent,
          ),
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./components/department-list/department-list').then((m) => m.DepartmentList),
      },
      { path: 'projects', component: Projects },
      { path: 'leaves', component: Leaves },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
