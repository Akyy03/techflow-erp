import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminStats {
  totalEmployees: number;
  activeProjects: number;
  pendingLeaves: number;
  urgentTasks: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/dashboard';

  getDashboardStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin-stats`);
  }

  getRecentTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recent-tasks`);
  }

  getTaskStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/task-stats`);
  }
}
