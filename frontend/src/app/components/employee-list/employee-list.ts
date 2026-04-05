import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee, Department } from '../../services/employee';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeListComponent implements OnInit {
  viewMode = signal<'grid' | 'table'>('grid');
  private router = inject(Router);
  private employeeService = inject(EmployeeService);

  // --- STATE MANAGEMENT ---
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  isModalOpen = signal(false);
  errorMessage = signal<string | null>(null);
  userRole = signal<string | null>(null);

  isEditMode = signal(false);
  editingEmployeeId = signal<number | null>(null);

  searchQuery = signal('');
  showDeleted = signal(false);

  newEmployee: any = {
    firstName: '',
    lastName: '',
    position: '',
    salary: 0,
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    department: { id: undefined, name: '' },
  };

  // --- CALCULATED DATA ---
  totalEmployees = computed(() => this.employees().filter((e) => !e.isDeleted).length);

  totalBudget = computed(() => {
    const role = this.userRole();
    const emps = this.filteredEmployees();

    if (role === 'ADMIN') {
      return emps.reduce((acc, emp) => acc + (emp.salary || 0), 0);
    } else {
      // Filtrăm managerii din calculul bugetului dacă nu suntem ADMIN
      return emps
        .filter((emp) => emp.role !== 'MANAGER')
        .reduce((acc, emp) => acc + (emp.salary || 0), 0);
    }
  });

  avgSalary = computed(() =>
    this.totalEmployees() > 0 ? this.totalBudget() / this.totalEmployees() : 0,
  );

  filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allEmployees = this.employees();
    const displayArchive = this.showDeleted();
    const role = this.userRole();

    return allEmployees.filter((emp) => {
      const isArchived = !!emp.isDeleted;

      // Filtrare Tab-uri: ADMIN poate comuta între Archive/Active, restul văd doar Active
      if (role === 'ADMIN') {
        if (displayArchive !== isArchived) return false;
      } else {
        if (isArchived) return false;
      }

      // Filtru de căutare
      if (query) {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        return (
          fullName.includes(query) ||
          emp.position?.toLowerCase().includes(query) ||
          emp.departmentName?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  });

  ngOnInit(): void {
    this.userRole.set(localStorage.getItem('role'));
    this.loadEmployees();
    this.loadDepartments();
  }

  // --- ACTIONS ---
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (data: any) => {
        const employeesArray = Array.isArray(data) ? data : (data.content || []);
        const role = this.userRole();
        const myEmail = localStorage.getItem('email');

        // Normalizare date
        let normalized = employeesArray.map((emp: any) => ({
          ...emp,
          isDeleted: !!(emp.isDeleted || emp.deleted)
        }));

        // Logica de Business pentru Manageri (filtrare pe departament)
        if (role === 'MANAGER' && myEmail) {
          const myProfile = normalized.find((e : Employee) => e.email === myEmail);
          if (myProfile) {
            const myDept = myProfile.departmentName;
            this.employees.set(normalized.filter((e : Employee) => e.departmentName === myDept));
          } else {
            this.employees.set([]);
          }
        } else {
          // ADMIN sau EMPLOYEE (serverul trimite deja ce trebuie)
          this.employees.set(normalized);
        }
      },
      error: (err) => console.error('API Error:', err),
    });
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe({
      next: (data) => this.departments.set(data),
      error: (err) => console.error('Error loading departments:', err),
    });
  }

  // --- MODAL MANAGEMENT ---
  openAddModal() {
    this.isEditMode.set(false);
    this.editingEmployeeId.set(null);
    this.resetForm();
    this.isModalOpen.set(true);
  }

  openEditModal(employee: any) {
    this.isEditMode.set(true);
    this.editingEmployeeId.set(employee.id || null);

    const foundDept = this.departments().find((d) => d.name === employee.departmentName);

    this.newEmployee = {
      ...employee,
      hireDate: employee.hireDate
        ? new Date(employee.hireDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      department: foundDept ? { ...foundDept } : { id: undefined, name: '' },
    };

    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.errorMessage.set(null);
    this.resetForm();
  }

  resetForm() {
    this.newEmployee = {
      firstName: '',
      lastName: '',
      position: '',
      salary: 0,
      email: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      department: { id: undefined, name: '' },
    };
  }

  // --- CRUD OPERATIONS ---
  saveEmployee() {
    this.errorMessage.set(null);

    const employeeData: Employee = {
      ...this.newEmployee,
      id: this.editingEmployeeId() || undefined,
      isDeleted: this.isEditMode() ? !!this.newEmployee.isDeleted : false,
    };

    const request = (this.isEditMode() && this.editingEmployeeId())
      ? this.employeeService.updateEmployee(this.editingEmployeeId()!, employeeData)
      : this.employeeService.addEmployee(employeeData);

    request.subscribe({
      next: () => {
        this.loadEmployees();
        this.closeModal();
      },
      error: (err) => this.handleBackendError(err),
    });
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to archive this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => this.loadEmployees(),
        error: (err) => console.error('Error archiving employee:', err),
      });
    }
  }

  restoreEmployee(id: number) {
    if (confirm('Reactivate this employee and their user account?')) {
      this.employeeService.restoreEmployee(id).subscribe({
        next: () => {
          this.showDeleted.set(false);
          this.loadEmployees();
        },
        error: (err) => console.error('Restore failed:', err),
      });
    }
  }

  private handleBackendError(err: any) {
    this.errorMessage.set(
      err.status === 409 ? 'Identity Conflict: Email or Phone already exists.' : 'System Error: Operation failed.'
    );
  }

  viewEmployeeProfile(id: number | undefined) {
    if (id) this.router.navigate(['/employees', id]);
  }
}