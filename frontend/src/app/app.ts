import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { EmployeeService, Employee } from './services/employee';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html'
})
export class App implements OnInit {
  // State Management cu Signals
  employees = signal<Employee[]>([]);
  isModalOpen = signal(false);
  errorMessage = signal<string | null>(null);
  
  // State pentru Editare
  isEditMode = signal(false);
  editingEmployeeId = signal<number | null>(null);
  
  newEmployee = {
    firstName: '',
    lastName: '',
    position: '',
    salary: 0,
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0]
  };

  private employeeService = inject(EmployeeService);

  // Statistici calculate automat
  totalEmployees = computed(() => this.employees().length);
  totalBudget = computed(() => this.employees().reduce((acc, emp) => acc + (emp.salary || 0), 0));
  avgSalary = computed(() => this.totalEmployees() > 0 ? this.totalBudget() / this.totalEmployees() : 0);

  ngOnInit(): void {
    this.loadEmployees();
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

  // Gestiune Modal
  openAddModal() {
    this.isEditMode.set(false);
    this.editingEmployeeId.set(null);
    this.resetForm();
    this.isModalOpen.set(true);
  }

  openEditModal(employee: Employee) {
    this.isEditMode.set(true);
    this.editingEmployeeId.set(employee.id || null);
    
    // Clonăm obiectul pentru a nu modifica direct în listă înainte de salvare
    this.newEmployee = { 
      ...employee, 
      // Ne asigurăm că data este în formatul corect pentru input type="date"
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

  // CRUD Actions unificate
  saveEmployee() {
    this.errorMessage.set(null);

    if (this.isEditMode() && this.editingEmployeeId()) {
      // Logica pentru UPDATE
      this.employeeService.updateEmployee(this.editingEmployeeId()!, this.newEmployee as Employee).subscribe({
        next: (updatedEmployee) => {
          this.employees.update(prev => 
            prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
          );
          this.closeModal();
        },
        error: (err) => this.handleBackendError(err)
      });
    } else {
      // Logica pentru CREATE (originală)
      this.employeeService.addEmployee(this.newEmployee as Employee).subscribe({
        next: (addedEmployee) => {
          this.employees.update(prev => [...prev, addedEmployee]);
          this.closeModal();
        },
        error: (err) => this.handleBackendError(err)
      });
    }
  }

  private handleBackendError(err: any) {
    if (err.status === 500 || err.status === 409) {
      this.errorMessage.set('Identity Conflict: Email or Phone already exists in the system.');
    } else {
      this.errorMessage.set('System Error: Operation failed.');
    }
    console.error('Operation Error:', err);
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

  viewEmployeeProfile(id: number) {
    console.log('Navigăm spre profilul angajatului:', id);
  }

  openQuickActions(id: number) {
    // Putem păstra asta pentru un meniu dropdown sau direct ștergere
    this.deleteEmployee(id);
  }
}