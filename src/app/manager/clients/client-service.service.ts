import { Injectable, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { firestore } from 'firebase/app';
import { of, Observable } from 'rxjs';
import { take, catchError, map } from 'rxjs/operators';

import { CheckIn, Payment } from 'src/app/shared/client.model';

@Injectable()
export class ClientService {

  // To be set in AppComponent where translated text is available
  i18n: ElementRef;

  constructor(private snack: MatSnackBar,
              private storage: AngularFireStorage,
              private afs: AngularFirestore) { }

  performCheckin(id: string, isCheckingIn: boolean) {
    if (!confirm(this.i18n.nativeElement.childNodes[7].textContent)) {
      return;
    }
    isCheckingIn = true;
    this.afs.collection<CheckIn>(`clients/${id}/checkins`, ref => ref
      .where('date', '>=', firestore.Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0))))
      .where('date', '<=', firestore.Timestamp.fromDate(new Date())))
      .valueChanges().pipe(take(1)).subscribe(data => {
        if (!data.length || confirm(this.i18n.nativeElement.childNodes[3].textContent)) {
          this.afs.collection<CheckIn>(`clients/${id}/checkins`).add({
            date: firestore.Timestamp.fromDate(new Date()),
          }).then(() => {
            this.snack.open(this.i18n.nativeElement.childNodes[4].textContent, 'X', { duration: 3000 });
            isCheckingIn = false;
          }).catch(() => {
            this.snack.open(this.i18n.nativeElement.childNodes[5].textContent, 'X', { duration: 3000 });
            isCheckingIn = false;
          });
        } else {
          this.snack.open(this.i18n.nativeElement.childNodes[6].textContent, 'X', { duration: 3000 });
          isCheckingIn = false;
        }
      }, () => {
        isCheckingIn = false;
        this.snack.open(this.i18n.nativeElement.childNodes[5].textContent, 'X', { duration: 3000 });
      });
  }

  getUrl(path: string, sex: string): Observable<string> {
    if (!path) {
      return of(sex === 'f' ? '/assets/default-profile-female.png' :
      '/assets/default-profile-male.png');
    }
    return this.storage.ref(path).getDownloadURL().pipe(
      catchError(() => of(sex === 'f' ? '/assets/default-profile-female.png' :
        '/assets/default-profile-male.png')
      )
    );
  }

  hasPayed(idSubscription: string) {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return this.afs.collection<Payment>('payments', ref => ref.where('idSubscription', '==', idSubscription)
    .where('date', '>=', firestore.Timestamp.fromDate(date)).orderBy('date', 'desc'))
    .valueChanges().pipe(
      map(ps => ps.filter(p => p.note.toLowerCase().search('registration') !== -1).length !== 0),
      map(p => p ? 'yes' : 'no')
    );
  }
}
