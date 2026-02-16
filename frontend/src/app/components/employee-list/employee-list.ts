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
  private router = inject(Router);
  private employeeService = inject(EmployeeService);

  // --- STATE MANAGEMENT (Signals) ---
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]); // Semnal nou pentru departamente
  isModalOpen = signal(false);
  errorMessage = signal<string | null>(null);
  userRole = signal<string | null>(null);

  // State pentru Editare
  isEditMode = signal(false);
  editingEmployeeId = signal<number | null>(null);

  // Search & Session
  searchQuery = signal('');

  // Obiectul pentru formular - am adăugat structura de department
  newEmployee: any = {
    firstName: '',
    lastName: '',
    position: '',
    salary: 0,
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    department: { id: undefined, name: '' }, // Inițializat pentru ngModel
  };

  // --- CALCULATED DATA (Signals) ---
  totalEmployees = computed(() => this.employees().length);
  totalBudget = computed(() => this.employees().reduce((acc, emp) => acc + (emp.salary || 0), 0));
  avgSalary = computed(() =>
    this.totalEmployees() > 0 ? this.totalBudget() / this.totalEmployees() : 0,
  );

  filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.employees();

    return this.employees().filter(
      (emp) =>
        emp.firstName?.toLowerCase().includes(query) ||
        emp.lastName?.toLowerCase().includes(query) ||
        emp.position?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.departmentName?.toLowerCase().includes(query), // Căutare și după departament
    );
  });

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments(); // Încărcăm departamentele la start
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
        this.employees.set(employeesArray);
      },
      error: (err) => console.error('Eroare API:', err),
    });
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe({
      next: (data) => this.departments.set(data),
      error: (err) => console.error('Eroare încărcare departamente:', err),
    });
  }

  // --- MODAL MANAGEMENT ---
  openAddModal() {
    this.isEditMode.set(false);
    this.editingEmployeeId.set(null);
    this.resetForm();
    this.loadDepartments(); // Refresh la listă când deschidem modalul
    this.isModalOpen.set(true);
  }

  openEditModal(employee: any) {
    // Folosim any aici ca să forțăm trecerea peste erori
    this.isEditMode.set(true);
    this.editingEmployeeId.set(employee.id || null);
    this.loadDepartments();

    // Luăm numele departamentului (care acum e un string simplu din DTO)
    const deptName = employee.departmentName;

    // Căutăm obiectul corespunzător în lista de departamente pentru dropdown
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
    };

    if (this.isEditMode() && this.editingEmployeeId()) {
      this.employeeService.updateEmployee(this.editingEmployeeId()!, employeeData).subscribe({
        next: (updatedEmployee) => {
          // Păstrăm logica ta de update manual în listă
          this.employees.update((prev) =>
            prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)),
          );

          // departmentName-ul nou din DTO este mapat corect pe card
          this.loadEmployees();

          this.closeModal();
        },
        error: (err) => this.handleBackendError(err),
      });
    } else {
      this.employeeService.addEmployee(employeeData).subscribe({
        next: (addedEmployee) => {
          this.employees.update((prev) => [...prev, addedEmployee]);

          // La fel și la adăugare, pentru a popula departamentul pe cardul nou
          this.loadEmployees();

          this.closeModal();
        },
        error: (err) => this.handleBackendError(err),
      });
    }
  }

  deleteEmployee(id: number) {
    if (confirm('Ești sigur că vrei să elimini acest talent din echipă?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.employees.update((prev) => prev.filter((e) => e.id !== id));
        },
        error: (err) => console.error('Eroare la ștergere:', err),
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

  viewEmployeeProfile(id: number) {
    this.router.navigate(['/employees', id]);
  }
}
