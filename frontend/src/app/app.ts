import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService, Employee } from './services/employee';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html'
})
export class App implements OnInit {
  employees = signal<Employee[]>([]);
  private employeeService = inject(EmployeeService);

  // Statistici calculate automat (Power of Signals 2026)
  totalEmployees = computed(() => this.employees().length);
  totalBudget = computed(() => this.employees().reduce((acc, emp) => acc + emp.salary, 0));
  avgSalary = computed(() => this.totalEmployees() > 0 ? this.totalBudget() / this.totalEmployees() : 0);

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => this.employees.set(data),
      error: (err) => console.error('API Error:', err)
    });
  }
}