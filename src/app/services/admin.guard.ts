import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

export const adminGuard = () => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  if (apiService.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/tabs/home']);
};