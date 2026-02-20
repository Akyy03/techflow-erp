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

  totalBudget = computed(() =>
    this.employees()
      .filter((e) => !e.isDeleted) // Ignorăm arhivatii
      .reduce((acc, emp) => acc + (emp.salary || 0), 0),
  );

  avgSalary = computed(() =>
    this.totalEmployees() > 0 ? this.totalBudget() / this.totalEmployees() : 0,
  );

  filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allEmployees = this.employees();
    const displayArchive = this.showDeleted();

    return allEmployees.filter((emp: any) => {
      // 1. Normalizăm statusul de ștergere (unele DB-uri trimit null/0/1)
      const isArchived = !!(emp.isDeleted || emp.deleted || emp.is_deleted);

      // Dacă suntem pe tab-ul Archive (displayArchive = true),
      // arătăm DOAR pe cei care au isArchived = true.
      if (displayArchive !== isArchived) return false;

      if (query) {
        return (
          emp.firstName?.toLowerCase().includes(query) ||
          emp.lastName?.toLowerCase().includes(query) ||
          emp.position?.toLowerCase().includes(query) ||
          emp.email?.toLowerCase().includes(query) ||
          (emp.departmentName && emp.departmentName.toLowerCase().includes(query))
        );
      }

      return true;
    });
  });

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
    this.userRole.set(localStorage.getItem('role'));
  }

  // --- ACTIONS ---
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (data: any) => {
        const employeesArray = Array.isArray(data) ? data : data.content || [];
        const normalized = employeesArray.map((emp: any) => ({
          ...emp,
          isDeleted: !!(emp.isDeleted || emp.deleted || emp.is_deleted),
        }));
        this.employees.set(normalized);
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
    this.loadDepartments();
    this.isModalOpen.set(true);
  }

  openEditModal(employee: any) {
    this.isEditMode.set(true);
    this.editingEmployeeId.set(employee.id || null);
    this.loadDepartments();

    const deptName = employee.departmentName;
    const foundDept = this.departments().find((d: any) => d.name === deptName);

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

  validatePhone(event: any) {
    const input = event.target;
    const cleanedValue = input.value.replace(/[^0-9+]/g, '');
    this.newEmployee.phone = cleanedValue;
    input.value = cleanedValue;
  }

  // --- CRUD OPERATIONS ---
  saveEmployee() {
    this.errorMessage.set(null);

    const employeeData: Employee = {
      ...this.newEmployee,
      id: this.editingEmployeeId() || undefined,
      // Păstrăm starea de arhivare dacă edităm, altfel e false (nou)
      isDeleted: this.isEditMode() ? !!this.newEmployee.isDeleted : false,
    };

    if (this.isEditMode() && this.editingEmployeeId()) {
      this.employeeService.updateEmployee(this.editingEmployeeId()!, employeeData).subscribe({
        next: (updatedEmployee) => {
          this.loadEmployees(); // Refresh complet pentru a lua DTO-ul corect de la server
          this.closeModal();
        },
        error: (err) => this.handleBackendError(err),
      });
    } else {
      this.employeeService.addEmployee(employeeData).subscribe({
        next: (addedEmployee) => {
          this.loadEmployees();
          this.closeModal();
        },
        error: (err) => this.handleBackendError(err),
      });
    }
  }

  deleteEmployee(id: number) {
    const msg = 'Are you sure you want to archive this employee? Access will be revoked.';
    if (confirm(msg)) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          // Modificăm starea locală a semnalului
          // filteredEmployees() va reacționa imediat și va scoate omul din listă
          this.employees.update((prev) =>
            prev.map((e) => (e.id === id ? { ...e, isDeleted: true } : e)),
          );
        },
        error: (err) => console.error('Error archiving employee:', err),
      });
    }
  }

  restoreEmployee(id: number) {
    if (confirm('Reactivate this employee and their user account?')) {
      this.employeeService.restoreEmployee(id).subscribe({
        next: (updatedEmp) => {
          this.loadEmployees();

          this.showDeleted.set(false);

          console.log('Employee restored and list refreshed.');
        },
        error: (err) => {
          console.error('Restore failed:', err);
        },
      });
    }
  }

  private handleBackendError(err: any) {
    if (err.status === 409 || err.status === 500) {
      this.errorMessage.set('Identity Conflict: Email or Phone already exists.');
    } else {
      this.errorMessage.set('System Error: Operation failed.');
    }
  }

  viewEmployeeProfile(id: number | undefined) {
    if (!id) return;
    this.router.navigate(['/employees', id]);
  }
}
