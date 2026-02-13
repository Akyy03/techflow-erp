import { CommonModule } from '@angular/common'; // Pentru directive de bază
import { FormsModule } from '@angular/forms'; // Aceasta este piesa lipsă!
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true, // Asigură-te că e setat pe true
  imports: [CommonModule, FormsModule], // Adaugă FormsModule AICI
  templateUrl: './login.html', // Asigură-te că fișierul se numește login.html, nu login.component.html
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials = { email: '', password: '' };

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  onLogin(): void {
    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        console.log('Login successful!', res);
        this.router.navigate(['/employees']); 
      },
      error: (err: any) => {
        console.error('Login error:', err);
        const errorMessage = (err && err.error && typeof err.error === 'string') 
                             ? err.error 
                             : 'Invalid credentials or server unreachable';
        alert('Login failed: ' + errorMessage);
      }
    });
  }
}