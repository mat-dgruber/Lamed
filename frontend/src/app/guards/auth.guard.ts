import { Injectable, inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private auth = inject(Auth);
  private router = inject(Router);
  user$ = user(this.auth);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.user$.pipe(
      take(1),
      map(user => !!user), // true if user exists, false otherwise
      tap(loggedIn => {
        if (!loggedIn) {
          console.log('Access denied. Redirecting to login.');
          // Redirect to login or home, assuming login modal or page exists
          this.router.navigate(['/login']); 
        }
      })
    );
  }
}
