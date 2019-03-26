import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { Observable } from 'rxjs';

import { Pack, Subscription, Payment } from 'src/app/shared/client.model';

@Component({
  selector: 'app-payment-add',
  templateUrl: './payment-add.component.html',
  styleUrls: ['./payment-add.component.css']
})
export class PaymentAddComponent implements OnInit {

  // True for registration fee, false for insurance
  payment = true;
  loading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    idClient: string,
    insurance: boolean;
    pack: {
      idPack: string,
      idSubscription: string;
      pack: Observable<Pack>,
      subscription: Observable<Subscription>
    }
  },          private afs: AngularFirestore,
              private snack: MatSnackBar) { }

  ngOnInit() {
  }

  addPayment() {
    this.loading = true;
    if (this.payment) {
      this.data.pack.pack.subscribe(p => {
        this.afs.collection<Payment>('payments').add({
          idClient: this.data.idClient,
          idSubscription: this.data.pack.idSubscription,
          price: p.price,
          date: firestore.Timestamp.fromDate(new Date()),
          note: 'Registration fee'
        }).then(() => {
          this.loading = false;
          this.snack.open('Payment Added successfully', 'Close', { duration: 3000 });
        }).catch(() => {
          this.loading = false;
          this.snack.open('Payment failed', 'Close', { duration: 3000 });
        });
      }, () => {
        this.loading = false;
        this.snack.open('Failed getting pack information', 'Close', { duration: 3000 });
      });
    } else {
      this.afs.firestore.batch()
        .set(this.afs.doc(`payments/${this.afs.createId()}`).ref, {
          idClient: this.data.idClient,
          idSubscription: this.data.pack.idSubscription,
          price: 100,
          date: firestore.Timestamp.fromDate(new Date()),
          note: 'Insurance  fee'
        }).update(this.afs.doc(`clients/${this.data.idClient}`).ref, { insurance: true })
        .commit()
        .then(() => {
          this.loading = false;
          this.snack.open('Insurance payed successfully', 'Close', { duration: 3000 });
        }).catch(() => {
          this.loading = false;
          this.snack.open('Failed paying insurance', 'Close', { duration: 3000 });
        });
    }
  }

}
