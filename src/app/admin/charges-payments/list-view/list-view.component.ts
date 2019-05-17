import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  LOCALE_ID
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as moment from 'moment';

import { Payment, Charge, ChargeWitId } from 'src/app/shared/client.model';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css']
})
export class ListViewComponent implements OnInit {
  @ViewChild('i18n') public i18n: ElementRef;
  payments: Observable<Payment[]>;
  charges: Observable<Charge[]>;
  paymentColumns = ['date', 'price', 'note', 'client'];
  chargesColumns = ['date', 'cost', 'name', 'description', 'delete'];

  constructor(
    private afs: AngularFirestore,
    public dialogRef: MatDialogRef<ListViewComponent>,
    private snack: MatSnackBar,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: string,
    @Inject(LOCALE_ID) protected locale: string
  ) {}

  ngOnInit() {
    moment.locale(this.locale);
    const startDate = moment(this.data, 'MMM YYYY').toDate();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59);
    this.payments = this.afs
      .collection<Payment>('payments', ref =>
        ref
          .where('date', '>=', firestore.Timestamp.fromDate(startDate))
          .where('date', '<=', firestore.Timestamp.fromDate(endDate))
          .orderBy('date', 'desc')
      )
      .valueChanges()
      .pipe(
        catchError(() => {
          this.snack.open(
            this.i18n.nativeElement.childNodes[0].textContent,
            'X',
            { duration: 3000 }
          );
          return of([]);
        })
      );
    this.charges = this.afs
      .collection<ChargeWitId>('charges', ref =>
        ref
          .where('date', '>=', firestore.Timestamp.fromDate(startDate))
          .where('date', '<=', firestore.Timestamp.fromDate(endDate))
          .orderBy('date', 'desc')
      )
      .snapshotChanges()
      .pipe(
        map(cs =>
          cs.map(c => {
            const data = c.payload.doc.data() as Charge;
            const id = c.payload.doc.id;
            return { id, ...data };
          })
        ),
        catchError(() => {
          this.snack.open(
            this.i18n.nativeElement.childNodes[1].textContent,
            'X',
            { duration: 3000 }
          );
          return of([]);
        })
      );
  }

  deleteCharge(id: string) {
    if (confirm(this.i18n.nativeElement.childNodes[2].textContent)) {
      this.afs.doc(`charges/${id}`).delete();
    }
  }

  toHtml(text: string) {
    return this.sanitizer.bypassSecurityTrustHtml(
      ('<i>' + text + '</i>').replace(/\n/g, '<br>')
    );
  }
}
