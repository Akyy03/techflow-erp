import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth'; // <--- Importă serviciul

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private router = inject(Router);
  private authService = inject(AuthService); // <--- Injectează AuthService

  showLogoutConfirm = signal(false);

  logout() {
    if (!this.showLogoutConfirm()) {
      this.showLogoutConfirm.set(true);

      setTimeout(() => {
        this.showLogoutConfirm.set(false);
      }, 3000);
    } else {
      // EXECUȚIA CORECTĂ:
      // Apelăm metoda de logout din serviciu care face clear() la tot
      // și te redirecționează corect.
      this.authService.logout();
    }
  }
}
