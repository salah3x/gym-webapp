import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {AngularFireAuth} from '@angular/fire/auth';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SigninComponent } from './signin/signin.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isAuthenticated: boolean;
  claims: any;

  constructor(private router: Router,
              private auth: AngularFireAuth,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {}

  ngOnInit() {
    this.auth.authState.subscribe(value => this.isAuthenticated = value != null);
    this.auth.idTokenResult.subscribe(r => {
      r ? this.claims = r.claims : this.claims = [];
      console.log(this.claims);
    });
  }

  onSigninOrSignout() {
    if (this.isAuthenticated) {
      this.auth.auth.signOut().then(value => {
        this.snackBar.open('Vous vous êtes déconnecté avec succès.', 'Fermer', {duration: 3000});
        this.router.navigate(['']);
      });
    } else {
      this.dialog.open(SigninComponent);
    }
  }

  hasClaim(claim: string) {
    return this.claims[claim];
  }
}
