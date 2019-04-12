import { Injectable, ElementRef } from '@angular/core';
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

  // To be set in AppComponent where translated text is available
  i18n: ElementRef;

  isAllowed(path: string): Observable<boolean> {
    return this.afAuth.user.pipe(
      mergeMap(user => {
        if (!user) {
          this.snackBar.open(this.i18n.nativeElement.childNodes[1].textContent, 'X', { duration: 3000 });
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
          this.snackBar.open(this.i18n.nativeElement.childNodes[2].textContent, 'X', { duration: 3000 });
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
