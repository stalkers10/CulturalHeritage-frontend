import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from './api.service';

export const authGuard: CanActivateFn = () => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  return apiService.isAuthenticated() || router.createUrlTree(['/login']);
};
