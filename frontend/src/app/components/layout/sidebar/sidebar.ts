import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private router = inject(Router);
  public authService = inject(AuthService);

  showLogoutConfirm = signal(false);

  logout() {
    if (!this.showLogoutConfirm()) {
      this.showLogoutConfirm.set(true);

      setTimeout(() => {
        this.showLogoutConfirm.set(false);
      }, 3000);
    } else {
      this.authService.logout();
    }
  }
}
