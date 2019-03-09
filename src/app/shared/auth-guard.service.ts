import { Injectable } from '@angular/core';
import {
  CanLoad,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  Route,
  Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, mergeMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanLoad, CanActivate {

  constructor(private afAuth: AngularFireAuth,
              private snackBar: MatSnackBar,
              private router: Router) { }

  isAllowed(path: string): Observable<boolean> {
    return this.afAuth.user.pipe(
      mergeMap(user => {
        if (!user) {
          this.snackBar.open('Veuillez se connécter d\'abord', 'Fermer', {duration: 3000});
          this.router.navigate(['/']);
          return of(null);
        }
        return this.afAuth.idTokenResult;
      }),
      map(r => {
        if (!r) {
          return false;
        }
        const isAllowed = r.claims[path];
        if (!isAllowed) {
          this.snackBar.open('Vous n\'avez pas le droit d\'accéder à cette page', 'Fermer', {duration: 3000});
          this.router.navigate(['/']);
        }
        return isAllowed;
      }),
      take(1)
    );
  }
  canLoad(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> | Promise<boolean> {
    return this.isAllowed(route.path);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.isAllowed(route.url[0].path);
  }
}
