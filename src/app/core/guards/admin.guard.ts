import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const appUser = await firstValueFrom(authService.appUser$);

  if (appUser?.role === 'dev' || appUser?.role === 'mj') {
    return true;
  }

  return router.createUrlTree(['/']);
};
