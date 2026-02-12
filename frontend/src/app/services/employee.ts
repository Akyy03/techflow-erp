import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id?: number; // Optional pentru că la adăugare nu avem încă ID
  firstName: string;
  lastName: string;
  position: string;
  salary: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/employees'; // Verifică să fie URL-ul tău corect

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  // ACEASTA ESTE METODA CARE LIPSEȘTE:
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}