import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { mergeMap, take, takeUntil } from 'rxjs/operators';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { User } from './user.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  constructor(
    private http: HttpClient,
    private auth: AngularFireAuth,
    private snack: MatSnackBar
  ) {}

  @ViewChild('i18n', { static: true }) public i18n: ElementRef;
  isWorking = false;
  users: User[];
  displayedColumns: string[] = [
    'email',
    'claims.superadmin',
    'claims.admin',
    'claims.manager'
  ];
  private ngUnsubscribe = new Subject();

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.users = [];
    this.auth.idToken
      .pipe(
        take(1),
        mergeMap(t =>
          this.http.post<User[]>(environment.superadminApi + 'users', {
            token: t
          })
        ),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        data => {
          data.forEach(u => {
            if (!u.claims) {
              u.claims = { superadmin: false, admin: false, manager: false };
            }
          });
          this.users = data;
        },
        error =>
          this.snack.open(
            this.i18n.nativeElement.childNodes[0].textContent +
              error.error.message ||
              this.i18n.nativeElement.childNodes[1].textContent,
            'X',
            { duration: 4000 }
          )
      );
  }

  onChange(toggle: MatSlideToggle, checked: boolean, ele: any, claim: string) {
    if (
      claim === 'superadmin' &&
      !confirm(this.i18n.nativeElement.childNodes[2].textContent)
    ) {
      toggle.checked = !checked;
      return;
    }
    this.isWorking = true;
    const newClaims = { ...ele.claims };
    newClaims[claim] = checked;
    this.auth.idToken
      .pipe(
        take(1),
        mergeMap(t =>
          this.http.post(environment.superadminApi + 'updateClaims', {
            token: t,
            email: ele.email,
            claims: newClaims
          })
        ),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        () => (this.isWorking = false),
        error => {
          toggle.checked = !checked;
          this.snack.open(
            this.i18n.nativeElement.childNodes[0].textContent +
              error.error.message ||
              this.i18n.nativeElement.childNodes[1].textContent,
            'X',
            { duration: 4000 }
          );
          this.isWorking = false;
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
