import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../../services/employee';
import { Employee } from '../../../services/employee';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.css',
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private empService = inject(EmployeeService);

  employee = signal<Employee | null>(null);

  ngOnInit() {
    // Luăm ID-ul din URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Chemăm service-ul (asigură-te că ai metoda getEmployeeById în service!)
      this.empService.getEmployeeById(+id).subscribe({
        next: (data) => this.employee.set(data),
        error: (err) => {
          console.error('Error fetching employee', err);
          this.router.navigate(['/employees']); // Dacă nu există, înapoi la listă
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
}
