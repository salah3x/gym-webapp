import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SigninComponent } from './signin/signin.component';
import { SidenavService } from './sidenav.service';
import { AuthGuardService } from './shared/auth-guard.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean;
  claims: any;
  @ViewChild('sidenav', { static: true }) public sideNav: MatSidenav;
  @ViewChild('i18n', { static: true }) public i18n: ElementRef;
  private ngUnsubscribe = new Subject();

  constructor(
    public router: Router,
    public auth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private sidenavService: SidenavService,
    private guard: AuthGuardService
  ) {}

  ngOnInit() {
    this.guard.i18n = this.i18n;
    this.auth.authState
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(value => (this.isAuthenticated = value != null));
    this.auth.idTokenResult.pipe(takeUntil(this.ngUnsubscribe)).subscribe(r => {
      r ? (this.claims = r.claims) : (this.claims = []);
    });
    this.sidenavService.setSideNav(this.sideNav);
  }

  onSigninOrSignout() {
    if (this.isAuthenticated) {
      this.auth.auth.signOut().then(() => {
        this.snackBar.open(
          this.i18n.nativeElement.childNodes[0].textContent,
          'X',
          { duration: 3000 }
        );
        this.router.navigate(['']);
      });
    } else {
      this.dialog.open(SigninComponent, { width: '350px' });
    }
  }

  hasClaim(claim: string) {
    return this.claims[claim];
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
