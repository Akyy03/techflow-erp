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
      // Admin vede tot
      return emps.reduce((acc, emp) => acc + (emp.salary || 0), 0);
    } else {
      // Managerul vede doar totalul celor care NU sunt manageri
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

    return allEmployees.filter((emp: any) => {
      // 1. Normalizăm statusul de ștergere
      const isArchived = !!(emp.isDeleted || emp.deleted || emp.is_deleted);

      // --- LOGICĂ FILTRARE ROLURI ---
      if (role === 'MANAGER') {
        // Managerul nu vede niciodată arhiva în lista principală
        if (isArchived) return false;
      } else {
        // Adminul vede Active sau Archive în funcție de toggle
        if (displayArchive !== isArchived) return false;
      }

      // --- LOGICĂ SEARCH ---
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
    // Întâi setăm rolul, apoi încărcăm angajații
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
        const employeesArray = Array.isArray(data) ? data : data.content || [];
        const role = this.userRole();
        const myEmail = localStorage.getItem('email'); // Folosim email-ul unic din storage

        // 1. Normalizăm datele (Arhivă, etc.)
        let normalized = employeesArray.map((emp: any) => ({
          ...emp,
          isDeleted: !!(emp.isDeleted || emp.deleted || emp.is_deleted),
        }));

        // 2. Logică specifică pentru MANAGER
        if (role === 'MANAGER' && myEmail) {
          // Găsim profilul managerului logat folosind email-ul (care e anchor sigur)
          const myProfile = normalized.find((e: any) => e.email === myEmail);

          if (myProfile) {
            const myDept = myProfile.departmentName;
            console.log(`Logat ca Manager: ${myEmail} | Departament: ${myDept}`);

            // Păstrăm doar angajații din același departament
            normalized = normalized.filter((emp: any) => emp.departmentName === myDept);
          } else {
            // Fallback în caz că email-ul de login nu există în lista de angajați
            console.error('Managerul nu a fost găsit în lista de angajați după email.');
            normalized = [];
          }
        }

        // 3. Setăm semnalul cu lista (filtrată sau nu, depinde de rol)
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
      isDeleted: this.isEditMode() ? !!this.newEmployee.isDeleted : false,
    };

    if (this.isEditMode() && this.editingEmployeeId()) {
      this.employeeService.updateEmployee(this.editingEmployeeId()!, employeeData).subscribe({
        next: () => {
          this.loadEmployees();
          this.closeModal();
        },
        error: (err) => this.handleBackendError(err),
      });
    } else {
      this.employeeService.addEmployee(employeeData).subscribe({
        next: () => {
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
        next: () => {
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
