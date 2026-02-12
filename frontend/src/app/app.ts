import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesar pentru formularul din modal
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
  isModalOpen = signal(false); // Controlează afișarea modalului
  
  // Obiect temporar pentru formular
  newEmployee = {
    firstName: '',
    lastName: '',
    position: '',
    salary: 0
  };

  private employeeService = inject(EmployeeService);

  // Statistici calculate automat
  totalEmployees = computed(() => this.employees().length);
  totalBudget = computed(() => this.employees().reduce((acc, emp) => acc + emp.salary, 0));
  avgSalary = computed(() => this.totalEmployees() > 0 ? this.totalBudget() / this.totalEmployees() : 0);

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (data) => this.employees.set(data),
      error: (err) => console.error('API Error:', err)
    });
  }

  // Gestiune Modal
  openAddModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.resetForm();
  }

  resetForm() {
    this.newEmployee = {
      firstName: '',
      lastName: '',
      position: '',
      salary: 0
    };
  }

  // CRUD Actions
  saveEmployee() {
    // Trimitem obiectul către backend
    this.employeeService.addEmployee(this.newEmployee as Employee).subscribe({
      next: (addedEmployee) => {
        // Update listă locală fără refresh
        this.employees.update(prev => [...prev, addedEmployee]);
        this.closeModal();
      },
      error: (err) => console.error('Eroare la salvare:', err)
    });
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

  // Navigation & Menus
  viewEmployeeProfile(id: number) {
    console.log('Navigăm spre profilul angajatului:', id);
    // Viitor: this.router.navigate(['/profile', id]);
  }

  openQuickActions(id: number) {
    // Momentan deschidem direct delete pentru testare rapidă
    this.deleteEmployee(id);
  }
}