// services/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as Array<string>;
  
  const userRole = authService.getRole() ?? '';

  if (expectedRoles && expectedRoles.includes(userRole)) {
    return true;
  }

  console.warn(`Access denied. Role: ${userRole}. Expected roles: ${expectedRoles}`);
  router.navigate(['/dashboard']);
  return false;
};