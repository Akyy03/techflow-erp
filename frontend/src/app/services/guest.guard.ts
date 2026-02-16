import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Dacă utilizatorul este deja logat (are token), îl redirecționăm "înăuntru"
  if (authService.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }

  // Altfel (dacă nu e logat), îl lăsăm să vadă pagina de login
  return true;
};
