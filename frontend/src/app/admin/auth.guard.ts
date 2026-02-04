import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const user$ = user(auth);

  return user$.pipe(
    take(1),
    map(currentUser => {
      if (currentUser) {
        return true;
      } else {
        return router.createUrlTree(['/admin/login']);
      }
    })
  );
};
