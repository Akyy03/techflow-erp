import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Modelează datele
export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  salary: number;
}

@Injectable({
  providedIn: 'root' // <--- Această linie îi spune lui Angular că serviciul e gata de injectat peste tot
})
export class EmployeeService { // <--- Verifică să ai "export" aici!
  private apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) { }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }
}