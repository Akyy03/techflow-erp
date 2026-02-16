import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { EmployeeService, Employee } from '../../services/employee';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
  // OnPush reduce lag-ul prin oprirea verificărilor inutile de fundal
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent implements OnInit {
  private router = inject(Router);
  private employeeService = inject(EmployeeService);

  // --- STATE MANAGEMENT (Signals) ---
  employees = signal<Employee[]>([]);
  isModalOpen = signal(false);
  errorMessage = signal<string | null>(null);
  userRole = signal<string | null>(null);
  
  // State pentru Editare
  isEditMode = signal(false);
  editingEmployeeId = signal<number | null>(null);

  // Search & Session
  searchQuery = signal('');
  
  // Obiectul pentru formular
  newEmployee: any = {
    firstName: '',
    lastName: '',
    position: '',
    salary: 0,
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0]
  };

  // --- CALCULATED DATA (Signals) ---
  totalEmployees = computed(() => this.employees().length);
  totalBudget = computed(() => this.employees().reduce((acc, emp) => acc + (emp.salary || 0), 0));
  avgSalary = computed(() => this.totalEmployees() > 0 ? this.totalBudget() / this.totalEmployees() : 0);

  // Logica de filtrare reactivă
  filteredEmployees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.employees();

    return this.employees().filter(emp => 
      emp.firstName?.toLowerCase().includes(query) || 
      emp.lastName?.toLowerCase().includes(query) || 
      emp.position?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.loadEmployees();
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
        const employeesArray = Array.isArray(data) ? data : (data.content || []);
        this.employees.set(employeesArray);
      },
      error: (err) => console.error('Eroare API:', err)
    });
  }

  // --- MODAL MANAGEMENT ---
  openAddModal() {
    this.isEditMode.set(false);
    this.editingEmployeeId.set(null);
    this.resetForm();
    this.isModalOpen.set(true);
  }

  openEditModal(employee: Employee) {
    this.isEditMode.set(true);
    this.editingEmployeeId.set(employee.id || null);
    // Clonăm obiectul pentru a evita legăturile directe care pot cauza lag
    this.newEmployee = { 
      ...employee, 
      hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
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
      hireDate: new Date().toISOString().split('T')[0]
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
      id: this.editingEmployeeId() || undefined
    };

    if (this.isEditMode() && this.editingEmployeeId()) {
      this.employeeService.updateEmployee(this.editingEmployeeId()!, employeeData).subscribe({
        next: (updatedEmployee) => {
          this.employees.update(prev => 
            prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
          );
          this.closeModal();
        },
        error: (err) => this.handleBackendError(err)
      });
    } else {
      this.employeeService.addEmployee(employeeData).subscribe({
        next: (addedEmployee) => {
          this.employees.update(prev => [...prev, addedEmployee]);
          this.closeModal();
        },
        error: (err) => this.handleBackendError(err)
      });
    }
  }

  deleteEmployee(id: number) {
    if (confirm('Ești sigur că vrei să elimini acest talent din echipă?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.employees.update(prev => prev.filter(e => e.id !== id));
        },
        error: (err) => console.error('Eroare la ștergere:', err)
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