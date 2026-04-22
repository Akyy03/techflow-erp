import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagerService } from '../../../services/manager.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['../admin/admin-dashboard.css']
})
export class ManagerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private managerService = inject(ManagerService);

  get deptId(): number {
  return this.authService.getDeptId();
}

  stats = signal<any>({ totalEmployees: 0, activeProjects: 0, pendingLeaves: 0, urgentTasks: 0 });
  recentTasks = signal<any[]>([]);
  chartData = signal<any[]>([]);
  loading = signal<boolean>(true);

  colorScheme: any = { domain: ['#64748b', '#6366f1', '#10b981'] };
  private readonly colorMap: Record<string, string> = {
    'TODO': '#64748b',
    'IN_PROGRESS': '#6366f1',
    'DONE': '#10b981'
  };

  ngOnInit() {
    this.loadManagerData();
  }

  loadManagerData() {
    const currentDeptId = this.deptId;
    if (currentDeptId === 0) return;

    this.managerService.getManagerStats(currentDeptId).subscribe(data => {
        this.stats.set(data);
    });

    this.managerService.getTaskStats(currentDeptId).subscribe(data => {
        this.chartData.set(this.formatChartData(data));
        this.loading.set(false);
    });

    this.managerService.getUpcomingTasks(currentDeptId).subscribe(tasks => {
        this.recentTasks.set(tasks);
    });
}

  private formatChartData(data: any[]): any[] {
    return data.map((item: any) => {
      const name = item.name || 'UNKNOWN';
      return {
        name: name,
        value: item.value || 0,
        color: this.colorMap[name] || '#64748b'
      };
    });
  }

  isUrgent(deadline: string | Date): boolean {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);

    return deadlineDate >= today && deadlineDate <= fiveDaysFromNow;
  }
}