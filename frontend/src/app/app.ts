import { Component, OnInit, inject, signal } from '@angular/core'; // am adăugat signal
import { CommonModule } from '@angular/common';
import { EmployeeService, Employee } from './services/employee';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html'
})
export class App implements OnInit {
  // 1. Declarăm un semnal în loc de un simplu array
  employees = signal<Employee[]>([]); 
  
  private employeeService = inject(EmployeeService);

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data: Employee[]) => {
        // 2. Setăm valoarea semnalului
        this.employees.set(data); 
        console.log('Datele au ajuns și au fost puse în semnal:', data);
      },
      error: (err: any) => console.error('Eroare:', err)
    });
  }
}