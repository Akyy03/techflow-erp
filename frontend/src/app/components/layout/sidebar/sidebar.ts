import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { EmployeeService } from '../../../services/employee';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private router = inject(Router);
  public authService = inject(AuthService);
  private employeeService = inject(EmployeeService);

  showLogoutModal = signal(false);
  showPhoneModal = signal(false);
  showPasswordModal = signal(false);

  newPhone = signal('');
  newPassword = signal('');

  // Computed signals pentru a verifica validitatea
  isPhoneValid = computed(() => {
    const phone = this.newPhone().trim();
    const phoneRegex = /^07\d{8}$/;
    return phone && phoneRegex.test(phone);
  });

  isPasswordValid = computed(() => {
    const password = this.newPassword().trim();
    return password && password.length >= 5;
  });

  // Metoda pentru a filtra doar cifrele din telefon
  onPhoneInput(event: any) {
    const input = event.target.value;
    const digitsOnly = input.replace(/\D/g, '');
    event.target.value = digitsOnly;
    this.newPhone.set(digitsOnly);
  }

  // Previne tastarea caracterelor non-cifre
  onPhoneKeydown(event: KeyboardEvent) {
    const key = event.key;
    // Permite: backspace, delete, tab, escape, enter, arrow keys, ctrl+c, ctrl+v, ctrl+x
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
      return;
    }
    // Permite combinatii cu Ctrl/Cmd (copy, paste, cut, select all)
    if (event.ctrlKey || event.metaKey) {
      return;
    }
    // Dacă nu e cifră, oprește evenimentul
    if (!/\d/.test(key)) {
      event.preventDefault();
    }
  }

  // --- LOGOUT ---
  openLogoutConfirm() { this.showLogoutModal.set(true); }
  cancelLogout() { this.showLogoutModal.set(false); }
  confirmLogout() {
    this.authService.logout();
    this.showLogoutModal.set(false);
    this.router.navigate(['/login']);
  }

  // --- MODALE ---
  openPhoneModal() { this.showPhoneModal.set(true); }
  openPasswordModal() { this.showPasswordModal.set(true); }
  
  closeModals() {
    this.showPhoneModal.set(false);
    this.showPasswordModal.set(false);
    this.newPhone.set('');
    this.newPassword.set('');
  }

  // --- LOGICA DE UPDATE REALĂ ---

  savePhone() {
    const phone = this.newPhone().trim();
    
    // Validare: nu gol
    if (!phone) {
      alert('Phone number cannot be empty');
      return;
    }
    
    // Validare: format 07xxxxxxxx (exact 10 digits, starts with 07)
    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(phone)) {
      alert('Phone number must be in format 07xxxxxxxx (e.g., 0712345678)');
      return;
    }

    const email = this.authService.getUserEmail();
    const payload = { phone: phone };

    this.employeeService.updateMyProfile(email, payload).subscribe({
      next: (res) => {
        console.log('Phone number updated!', res);
        this.closeModals();
        alert('Phone number updated successfully!');
      },
      error: (err) => alert('Error updating phone number')
    });
  }

  savePassword() {
    const password = this.newPassword().trim();
    
    // Validare: nu gol
    if (!password) {
      alert('Password cannot be empty');
      return;
    }
    
    // Validare: minim 5 caractere
    if (password.length < 5) {
      alert('Password must have at least 5 characters');
      return;
    }

    const email = this.authService.getUserEmail();
    const payload = {
      user: {
        password: password
      }
    };

    this.employeeService.updateMyProfile(email, payload).subscribe({
      next: (res) => {
        console.log('Password changed!', res);
        this.closeModals();
        alert('Password has been changed successfully!');
      },
      error: (err) => alert('Error changing password')
    });
  }
}