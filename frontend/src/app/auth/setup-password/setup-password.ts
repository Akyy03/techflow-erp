import { Component, inject } from '@angular/core'; // Adaugă inject
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesar pentru input-ul parolei
import { CommonModule } from '@angular/common'; // Necesar pentru erori/stiluri

@Component({
  selector: 'app-setup-password',
  standalone: true, // Asigură-te că e standalone dacă nu o declari în module
  imports: [FormsModule, CommonModule],
  templateUrl: './setup-password.html',
  styleUrl: './setup-password.css',
})
export class SetupPassword {
  newPassword = '';
  error = '';

  // Folosim inject pentru a fi moderni și consistenți
  private http = inject(HttpClient);
  private router = inject(Router);

  submitNewPassword() {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      this.error = "Error: Invalid session. Please log in again.";
      return;
    }

    // Trimitem parola ca text simplu (așa cum așteaptă backend-ul tău)
    this.http.post(`http://localhost:8080/api/users/${userId}/change-password`, this.newPassword)
      .subscribe({
        next: () => {
          localStorage.setItem('needsPasswordChange', 'false');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = "Failed to update password. Please try again.";
          console.error(err);
        }
      });
  }
}