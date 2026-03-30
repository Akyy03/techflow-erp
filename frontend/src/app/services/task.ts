import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignedToName: string;
  deadline: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) {}

  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
  }

  updateTaskStatus(taskId: number, status: string): Observable<void> {
    // Trimitem statusul ca Query Parameter: ?status=DONE
    return this.http.patch<void>(
      `http://localhost:8080/api/tasks/${taskId}/status?status=${status}`,
      {},
    );
  }
}
