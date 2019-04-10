import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import {AngularFireAuth} from '@angular/fire/auth';
import { MatDialog, MatSnackBar, MatSidenav } from '@angular/material';
import { SigninComponent } from './signin/signin.component';
import { SidenavService } from './sidenav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isAuthenticated: boolean;
  claims: any;
  @ViewChild('sidenav') public sideNav: MatSidenav;
  @ViewChild('i18n') public i18n: ElementRef;

  constructor(public router: Router,
              public auth: AngularFireAuth,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private sidenavService: SidenavService) {}

  ngOnInit() {
    this.auth.authState.subscribe(value => this.isAuthenticated = value != null);
    this.auth.idTokenResult.subscribe(r => {
      r ? this.claims = r.claims : this.claims = [];
    });
    this.sidenavService.setSideNav(this.sideNav);
  }

  onSigninOrSignout() {
    if (this.isAuthenticated) {
      this.auth.auth.signOut().then(() => {
        this.snackBar.open(this.i18n.nativeElement.childNodes[0].textContent, 'X', {duration: 3000});
        this.router.navigate(['']);
      });
    } else {
      this.dialog.open(SigninComponent, {width: '350px'});
    }
  }

  hasClaim(claim: string) {
    return this.claims[claim];
  }
}
