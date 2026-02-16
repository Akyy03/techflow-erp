import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  onInput(): void {
    // Ștergem eroarea doar dacă utilizatorul chiar modifică ceva
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  login(): void {
    // Validare de siguranță: dacă butonul e disabled dar se apasă Enter forțat
    if (!this.email || !this.password) return;

    const credentials = { email: this.email, password: this.password };

    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        // RESETĂM mesajul forțat și îl repunem după un ciclu de randare (Tick)
        // Asta garantează că animația/mesajul reapare chiar dacă eroarea e aceeași
        this.errorMessage = '';

        setTimeout(() => {
          this.errorMessage =
            err?.error && typeof err.error === 'string'
              ? err.error
              : 'ACCESS_DENIED: Invalid credentials or offline node.';
        }, 50); // 50ms e suficient pentru ca DOM-ul să proceseze dispariția
      },
    });
  }
}
