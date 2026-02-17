import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee, EmployeeService } from '../../../services/employee';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css',
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private empService = inject(EmployeeService);

  employee = signal<Employee | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.empService.getEmployeeById(+id).subscribe({
        next: (data) => this.employee.set(data),
        error: (err) => {
          console.error('Error fetching employee', err);
          this.router.navigate(['/employees']);
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/employees']);
  }

  getSeniority(hireDate: string | undefined): string {
    if (!hireDate) return 'N/A';
    const start = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    const months = Math.floor(diffDays / 30);
    if (months < 12) return `${months} months`;

    const years = (diffDays / 365).toFixed(1);
    return `${years} years in company`;
  }

  changeRole(newRole: 'EMPLOYEE' | 'MANAGER') {
    const currentEmp = this.employee();
    if (!currentEmp || currentEmp.id === undefined) return;

    const fullName = `${currentEmp.firstName} ${currentEmp.lastName}`;
    const msg =
      newRole === 'MANAGER'
        ? `Elevate ${fullName} to Management level?`
        : `Revoke management privileges for ${fullName}?`;

    if (confirm(msg)) {
      // Clonăm obiectul cu atenție
      const updatedEmployee: Employee = {
        ...currentEmp,
        role: newRole,
      };

      console.log('Sending update to server:', updatedEmployee);

      this.empService.updateEmployee(currentEmp.id, updatedEmployee).subscribe({
        next: (res) => {
          // Forțăm refresh-ul datelor din răspunsul serverului
          this.employee.set(res);
          // Dacă seniority tot dispare, înseamnă că 'res' vine de la server fără hireDate
          console.log('Update successful, server returned:', res);
        },
        error: (err) => {
          console.error('Full Error Object:', err);
          alert(`System failure: ${err.message || 'Check backend logs.'}`);
        },
      });
    }
  }
}
