import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.html',
  styleUrls: ['./leaves.css'],
})
export class LeavesComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);

  currentUserId = Number(localStorage.getItem('userId'));
  deptId = Number(localStorage.getItem('deptId'));

  isAdmin = this.authService.isAdmin();
  isManager = this.authService.isManager();

  newRequest = { startDate: '', endDate: '', type: 'VACATION', reason: '' };

  // SEPARARE DATE:
  myRequests: any[] = []; // Cererile mele personale
  teamRequests: any[] = []; // Cererile pe care trebuie să le aprob (Manager/Admin)
  showRejectInput: { [key: number]: boolean } = {};
  toggleRejectBox(id: number) {
    this.showRejectInput[id] = !this.showRejectInput[id];
  }

  message: string = '';
  isSubmitting = false;
  minDate: string = '';

  ngOnInit(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];

    this.loadData();
  }

  loadData() {
    if (this.isAdmin) {
      this.loadAllRequests(); // Adminul vede DOAR tabelul mare
    } else {
      // Angajatul și Managerul își văd propriile cereri
      if (this.currentUserId) {
        this.loadEmployeeRequests();
      }
      // Managerul vede în plus și echipa
      if (this.isManager && this.deptId) {
        this.loadDepartmentRequests();
      }
    }
  }

  // Cererile PERSONALE (Angajat)
  loadEmployeeRequests() {
    this.leaveService.getMyRequests(this.currentUserId).subscribe({
      next: (data) => {
        this.myRequests = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.message = 'Error loading personal history.';
      },
    });
  }

  // Cererile ECHIPEI (Manager)
loadDepartmentRequests() {
  this.leaveService.getDepartmentRequests(this.deptId).subscribe({
    next: (data) => {
      const all = data || [];
      this.teamRequests = all.filter(req => 
        req.employee?.position !== 'Architect' && 
        req.employee?.id !== this.currentUserId
      );
      this.cdr.detectChanges();
    }
  });
}

  // Cererile GLOBALE (Admin)
  loadAllRequests() {
  this.leaveService.getAllRequests().subscribe({
    next: (data) => {
      // Adminul vede tot, dar dacă vrei să nu își vadă propriile cereri în lista de procesare:
      this.teamRequests = (data || []).filter(
        (req: any) => req.employee.id !== this.currentUserId
      );
      this.cdr.detectChanges();
    },
    error: (err) => (this.message = 'Error loading global registry.'),
  });
}

  submitRequest() {
    if (!this.newRequest.startDate || !this.newRequest.endDate) {
      this.message = 'Please select the period.';
      return;
    }

    this.isSubmitting = true;
    this.leaveService.createRequest(this.currentUserId, this.newRequest).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.message = 'Success! Request submitted.';
        this.resetForm();
        this.loadEmployeeRequests(); // Refresh doar la lista mea
      },
      error: (err) => {
        this.isSubmitting = false;
        this.message = 'Eroare: ' + (err.error?.message || 'Nu s-a putut trimite cererea.');
      },
    });
  }

  private resetForm() {
    this.newRequest = { startDate: '', endDate: '', type: 'VACATION', reason: '' };
  }

  deleteRequest(id: number) {
    if (confirm('Are you sure you want to delete this request?')) {
      this.leaveService.deleteRequest(id).subscribe({
        next: () => {
          this.message = 'Request deleted successfully.';
          this.myRequests = this.myRequests.filter((req) => req.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting request:', err);
          this.message = 'Error deleting request. Please try again.';
        },
      });
    }
  }

  // LOGICA DE APROBARE/RESPINGERE

  approveRequest(id: number) {
    const comment = prompt('Optional: Observations for approval:');
    if (comment !== null) {
      // Dacă nu a dat Cancel
      this.updateStatus(id, 'APPROVED', comment);
    }
  }

  // Înlocuiește rejectRequest cu asta
rejectRequest(id: number, reason: string) {
  if (!reason || reason.trim() === '') {
    alert('Te rugăm să introduci un motiv pentru respingere.');
    return;
  }
  this.isSubmitting = true;
  // Folosim direct updateStatus pentru a păstra logica de refresh unitară
  this.updateStatus(id, 'REJECTED', reason);
  this.showRejectInput[id] = false;
  this.isSubmitting = false;
}

// Actualizează updateStatus să fie mai robustă
private updateStatus(id: number, status: 'APPROVED' | 'REJECTED', comment: string = '') {
  this.leaveService.updateRequestStatus(id, status, comment).subscribe({
    next: () => {
      this.message = `Request successfully ${status.toLowerCase()}.`;
      // Forțăm reîncărcarea tuturor surselor de date
      this.loadData(); 
      
      // DEBUG: Verificăm în consolă dacă obiectul nou are manager_comment
      console.log(`Status updated to ${status}. Refreshing data...`);
    },
    error: (err) => {
      this.message = 'Error: ' + (err.error?.message || 'Failed to update status.');
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  });
}

  // Helper pentru trackBy în HTML (performanță)
  trackByRequestId(index: number, item: any) {
    return item.id;
  }
}
