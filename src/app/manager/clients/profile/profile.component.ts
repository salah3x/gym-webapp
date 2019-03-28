import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { firestore } from 'firebase/app';
import { map, catchError, switchMap, take } from 'rxjs/operators';
import { of, Observable, combineLatest } from 'rxjs';

import { Client, ClientWithId, Pack, Payment, Subscription, CheckIn } from 'src/app/shared/client.model';
import { PaymentAddComponent } from './payment-add/payment-add.component';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  client: ClientWithId;
  isLoading = true;
  isCheckingIn = false;
  isAdmin = false;

  constructor(private route: ActivatedRoute,
              private afs: AngularFirestore,
              private sanitizer: DomSanitizer,
              private storage: AngularFireStorage,
              private auth: AngularFireAuth,
              private snack: MatSnackBar,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.auth.idTokenResult.subscribe(r => r ? r.claims ? this.isAdmin = r.claims.admin : false : false);
    const id = this.route.snapshot.params.id;
    this.afs.doc<Client>(`clients/${id}`).valueChanges()
      .pipe(
        // add a url field with an observable of dawnload url
        // add a pack field with an observable of the pack object
        // add a subscription field with an observable of the subscription object
        map(c => {
          (c as any).url = this.storage.ref(c.photo).getDownloadURL().pipe(
            catchError(() => of(c.sex === 'f' ? '/assets/default-profile-female.png' :
              '/assets/default-profile-male.png')));
          (c.pack as any).pack = this.afs.doc<Pack>(`packs/${c.pack.idPack}`).valueChanges();
          const date = new Date();
          date.setMonth(date.getMonth() - 1);
          (c as any).payed = this.afs.collection<Payment>('payments', ref => ref.where('idSubscription', '==', c.pack.idSubscription)
            .where('date', '>=', firestore.Timestamp.fromDate(date)))
            .valueChanges().pipe(
              map(ps => ps.filter(p => p.note.toLowerCase().search('registration') !== -1).length !== 0),
              map(p => p ? 'yes' : 'no')
            );
          (c.pack as any).subscription = this.afs.doc<Subscription>(`packs/${c.pack.idPack}/subscriptions/${c.pack.idSubscription}`)
            .valueChanges();
          return c;
        })
      ).subscribe(
        c => { this.isLoading = false; this.client = { ...c, id }; },
        () => { this.isLoading = false; this.snack.open('Connexion failed', 'Close', { duration: 3000 }); }
      );
    // Get checkins and payments of this client (for the past past year)
    // payments are either made by the client or by someone else in the same subscription
    // const startDate = new Date();
    // startDate.setFullYear(startDate.getFullYear() - 1);
    // const timestamp = firestore.Timestamp.fromDate(startDate);
    // this.payments = this.afs.doc<Client>(`clients/${id}`).valueChanges().pipe(
    //   switchMap(c => {
    //     return combineLatest(
    //       this.afs.collection<Payment>('payments', ref => ref
    //         .where('idClient', '==', id)
    //         .where('date', '>=', timestamp)
    //       ).valueChanges(),
    //       this.afs.collection<Payment>('payments', ref => ref
    //         .where('idSubscription', '==', c.pack.idSubscription)
    //         .where('date', '>=', timestamp)
    //       ).valueChanges()
    //     );
    //   }),
    //   map(list => {
    //     const [first, second] = list;
    //     return first.concat(second);
    //   }),
    //   map(array => Array.from(new Set(array.map(c => c.date.seconds)))
    //     .map(seconds => array.find(c => c.date.seconds === seconds))
    //   ));
  }

  openPaymentDialog() {
    if (!this.isAdmin) {
      return;
    }
    this.dialog.open(PaymentAddComponent, {
      width: '350px',
      data: { ...this.client }
    });
  }

  performCheckin(id: string) {
    this.isCheckingIn = true;
    this.afs.collection<CheckIn>(`clients/${id}/checkins`, ref => ref
      .where('date', '>=', firestore.Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0))))
      .where('date', '<=', firestore.Timestamp.fromDate(new Date())))
      .valueChanges().pipe(take(1)).subscribe(data => {
        if (!data.length || confirm('This client has already checked in today.\nCheck in anyway ?')) {
          const note = prompt('Add a note (optional) :');
          if (note === null) {
            this.snack.open('Check in cancelled', 'Close', { duration: 3000 });
            this.isCheckingIn = false;
            return;
          }
          this.afs.collection<CheckIn>(`clients/${id}/checkins`).add({
            date: firestore.Timestamp.fromDate(new Date()),
            note,
          }).then(() => {
            this.snack.open('Checked in successfully', 'Close', { duration: 3000 });
            this.isCheckingIn = false;
          }).catch(() => {
            this.snack.open('Check in failed', 'Close', { duration: 3000 });
            this.isCheckingIn = false;
          });
        } else {
          this.isCheckingIn = false;
        }
      }, () => {
        this.isCheckingIn = false;
        this.snack.open('Check in failed', 'Close', { duration: 3000 });
      });
  }

  toHtml(text: string) {
    if (!text || !text.length) {
      return '<i>Not provided</i>';
    }
    return this.sanitizer.bypassSecurityTrustHtml(('<i>' + text + '</i>').replace(/\n/g, '<br>'));
  }
}
