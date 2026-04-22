import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/dashboard/manager';

  getTaskStats(deptId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${deptId}/tasks`);
  }

  getProjectStats(deptId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${deptId}/projects`);
  }

  getManagerStats(deptId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${deptId}/stats`);
  }

  getUpcomingTasks(deptId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${deptId}/upcoming-tasks`);
  }
}
