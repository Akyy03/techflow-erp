import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificăm strict dacă avem token valid prin metoda din service
  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Dacă nu e logat, curățăm resturile (opțional) și trimitem la login
    router.navigate(['/login']);
    return false;
  }
};
