import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, Sidebar], 
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css'
})
export class AdminShell {
  public authService = inject(AuthService);
}