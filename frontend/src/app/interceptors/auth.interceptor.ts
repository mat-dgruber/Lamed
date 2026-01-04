import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth, idToken } from '@angular/fire/auth';
import { switchMap, take } from 'rxjs/operators';
import { from, of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  
  // Use 'idToken' observable from AngularFire to get the current token reactively
  // Or manually check currentUser if we want a snapshot, but reactive is safer for refresh.
  // Actually, simplest consistent way:
  
  if (auth.currentUser) {
      return from(auth.currentUser.getIdToken()).pipe(
          switchMap(token => {
              const clone = req.clone({
                  setHeaders: {
                      Authorization: `Bearer ${token}`
                  }
              });
              return next(clone);
          })
      );
  }
  
  return next(req);
};
