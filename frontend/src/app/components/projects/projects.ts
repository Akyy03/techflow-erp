import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, ProjectService } from '../../services/project';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.html',
  styleUrls: ['./projects.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = []; // Lista filtrată pe care o afișăm în UI
  loading: boolean = true;
  showModal: boolean = false;
  projectForm: FormGroup;

  today: string = '';
  
  // Informații despre utilizatorul logat
  userRole: string = '';
  userDeptId: number | null = null;

  constructor(
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      deadline: ['', Validators.required],
      status: ['ACTIVE', Validators.required],
    });
  }

  ngOnInit(): void {
  // Citim direct cheile din localStorage așa cum apar ele la tine
  this.userRole = localStorage.getItem('role') || '';
  
  // deptId la tine este 0 pentru Admin, îl convertim în număr
  const storedDeptId = localStorage.getItem('deptId');
  this.userDeptId = storedDeptId !== null ? Number(storedDeptId) : null;

  console.log('Detectat Rol:', this.userRole); // Ar trebui să zică ADMIN
  console.log('Detectat DeptId:', this.userDeptId); // Ar trebui să zică 0

  this.today = new Date().toISOString().split('T')[0];
  this.loadProjects();
}

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.applySecurityFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading projects', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Logica centrală de filtrare a proiectelor în funcție de ROL
  applySecurityFilter(): void {
  // 1. Dacă e ADMIN, nu mai stăm la discuții, arătăm tot
  if (this.userRole === 'ADMIN') {
    this.filteredProjects = [...this.projects];
    return;
  }

  // 2. Dacă e MANAGER, filtrăm pe baza deptId (care nu e 0)
  if (this.userRole === 'MANAGER' && this.userDeptId !== null) {
    this.filteredProjects = this.projects.filter(p => 
      p.departmentIds && p.departmentIds.includes(this.userDeptId!)
    );
  } else {
    // 3. Orice altceva (Employee sau neautentificat)
    this.filteredProjects = [];
  }
}

  openModal(): void {
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.projectForm.reset({ status: 'ACTIVE' });
    this.cdr.detectChanges();
  }

  submitProject(): void {
    if (this.projectForm.valid) {
      this.projectService.createProject(this.projectForm.value).subscribe({
        next: (newProject) => {
          this.projects.push(newProject);
          this.applySecurityFilter(); // Re-filtrăm după adăugare
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error saving project', err);
          alert('A apărut o eroare la salvarea proiectului!');
        },
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-active';
      case 'ON_HOLD': return 'status-hold';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  }
}