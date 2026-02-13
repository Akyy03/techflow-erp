import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login'; // verifică calea
import { EmployeeListComponent } from './components/employee-list/employee-list';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Cine intră pe prima pagină, merge la login
  { path: '**', redirectTo: 'login' } // Orice rută greșită merge la login
];