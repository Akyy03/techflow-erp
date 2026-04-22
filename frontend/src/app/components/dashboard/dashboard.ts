import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { EmployeeDashboardComponent } from './employee/employee-dashboard';
import { AdminDashboardComponent } from './admin/admin-dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, EmployeeDashboardComponent, AdminDashboardComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  userRole: string | null = null;

  ngOnInit() {
    this.userRole = this.authService.getRole();
  }
}