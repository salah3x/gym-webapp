import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { take } from 'rxjs/operators';

import { Pack, Payment, ClientWithId } from 'src/app/shared/client.model';

@Component({
  selector: 'app-payment-add',
  templateUrl: './payment-add.component.html',
  styleUrls: ['./payment-add.component.css']
})
export class PaymentAddComponent implements OnInit {

  // True for registration fee, false for insurance
  payment = true;
  loading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ClientWithId,
              private afs: AngularFirestore,
              private snack: MatSnackBar,
              private dialogRef: MatDialogRef<PaymentAddComponent>) { }

  ngOnInit() {
  }

  addPayment() {
    this.loading = true;
    if (this.payment) {
      this.afs.doc<Pack>(`packs/${this.data.pack.idPack}`).valueChanges().pipe(take(1)).subscribe(p => {
        this.afs.collection<Payment>('payments').add({
          idClient: this.data.id,
          idSubscription: this.data.pack.idSubscription,
          price: p.price,
          date: firestore.Timestamp.fromDate(new Date()),
          note: 'Registration fee'
        }).then(() => {
          this.loading = false;
          this.snack.open('Payment Added successfully', 'Close', { duration: 3000 });
          this.dialogRef.close();
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
          idClient: this.data.id,
          idSubscription: this.data.pack.idSubscription,
          price: 100,
          date: firestore.Timestamp.fromDate(new Date()),
          note: 'Insurance  fee'
        }).update(this.afs.doc(`clients/${this.data.id}`).ref, { insurance: true })
        .commit()
        .then(() => {
          this.loading = false;
          this.snack.open('Insurance payed successfully', 'Close', { duration: 3000 });
          this.dialogRef.close();
        }).catch(() => {
          this.loading = false;
          this.snack.open('Failed paying insurance', 'Close', { duration: 3000 });
        });
    }
  }

}
