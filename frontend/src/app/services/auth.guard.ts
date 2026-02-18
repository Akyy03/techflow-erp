import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const needsPasswordChange = localStorage.getItem('needsPasswordChange') === 'true';

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // DACĂ are nevoie de schimbarea parolei și NU este deja pe pagina de setup
  if (needsPasswordChange && state.url !== '/setup-password') {
    router.navigate(['/setup-password']);
    return false;
  }

  // Verificăm strict dacă avem token valid prin metoda din service
  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Dacă nu e logat, curățăm resturile (opțional) și trimitem la login
    router.navigate(['/login']);
    return false;
  }
};
