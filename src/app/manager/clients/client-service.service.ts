import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { firestore } from 'firebase/app';
import { take, catchError, map } from 'rxjs/operators';

import { CheckIn, Payment } from 'src/app/shared/client.model';
import { of } from 'rxjs';

@Injectable()
export class ClientService {

  constructor(private snack: MatSnackBar,
              private storage: AngularFireStorage,
              private afs: AngularFirestore) { }

  performCheckin(id: string, isCheckingIn: boolean) {
    if (!confirm('Confirm ?')) {
      return;
    }
    isCheckingIn = true;
    this.afs.collection<CheckIn>(`clients/${id}/checkins`, ref => ref
      .where('date', '>=', firestore.Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0))))
      .where('date', '<=', firestore.Timestamp.fromDate(new Date())))
      .valueChanges().pipe(take(1)).subscribe(data => {
        if (!data.length || confirm('This client has already checked in today.\nCheck in anyway ?')) {
          this.afs.collection<CheckIn>(`clients/${id}/checkins`).add({
            date: firestore.Timestamp.fromDate(new Date()),
          }).then(() => {
            this.snack.open('Checked in successfully', 'Close', { duration: 3000 });
            isCheckingIn = false;
          }).catch(() => {
            this.snack.open('Check in failed', 'Close', { duration: 3000 });
            isCheckingIn = false;
          });
        } else {
          this.snack.open('Check in canceled', 'Close', { duration: 3000 });
          isCheckingIn = false;
        }
      }, () => {
        isCheckingIn = false;
        this.snack.open('Check in failed', 'Close', { duration: 3000 });
      });
  }

  getUrl(path: string, sex: string) {
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
    .where('date', '>=', firestore.Timestamp.fromDate(date)))
    .valueChanges().pipe(
      map(ps => ps.filter(p => p.note.toLowerCase().search('registration') !== -1).length !== 0),
      map(p => p ? 'yes' : 'no')
    );
  }
}
