import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { mergeMap, take } from 'rxjs/operators';
import { MatSnackBar, MatSlideToggle } from '@angular/material';
import { environment } from 'src/environments/environment';
import { User } from './user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  constructor(private http: HttpClient,
              private auth: AngularFireAuth,
              private snack: MatSnackBar) { }

  isWorking = false;
  users: User[];
  displayedColumns: string[] = ['email', 'claims.superadmin', 'claims.admin', 'claims.manager'];
  baseUrl = environment.production ? '/api/superadmin/' :
    // 'http://localhost:5000/gym-webapp/us-central1/superadmin/api/superadmin/';
    'https://us-central1-gym-webapp.cloudfunctions.net/superadmin/api/superadmin/';

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.users = [];
    this.auth.idToken.pipe(
      take(1),
      mergeMap(t => this.http.post<User[]>(this.baseUrl + 'users', { token: t }))
    ).subscribe(
      data => {
        data.forEach(u => {
          if (!u.claims) {
            u.claims = {superadmin: false, admin: false, manager: false};
          }
        });
        this.users = data;
      },
      error => this.snack.open(`Server Error: ${error.error.message || 'Unknown'}`, 'Fermer', { duration: 4000 })
    );
  }

  onChange(toggle: MatSlideToggle, checked: boolean, ele: any, claim: string) {
    if (claim === 'superadmin' && !confirm('Continuer ?')) {
      toggle.checked = !checked;
      return;
    }
    this.isWorking = true;
    const newClaims = {...ele.claims};
    newClaims[claim] = checked;
    this.auth.idToken.pipe(
      take(1),
      mergeMap(t => this.http.post(this.baseUrl + 'updateClaims', { token: t, email: ele.email, claims: newClaims }))
    ).subscribe(
      () => this.isWorking = false,
      error => {
        toggle.checked = !checked;
        this.snack.open(`Server Error: ${error.error.message || 'Unknown'}`, 'Fermer', { duration: 4000 });
        this.isWorking = false;
      }
    );
  }
}
