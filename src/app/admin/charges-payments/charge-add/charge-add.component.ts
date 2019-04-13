import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { Charge } from 'src/app/shared/client.model';

@Component({
  selector: 'app-charge-add',
  templateUrl: './charge-add.component.html',
  styleUrls: ['./charge-add.component.css']
})
export class ChargeAddComponent implements OnInit {

  @ViewChild('i18n') public i18n: ElementRef;
  isLoading = false;
  curentDate = new Date();

  constructor(private afs: AngularFirestore,
              private dialogRef: MatDialogRef<ChargeAddComponent>,
              private snack: MatSnackBar) { }

  ngOnInit() {
  }

  onSubmit(f: NgForm) {
    this.isLoading = true;
    const charge: Charge = f.value;
    this.afs.collection<Charge>('charges').add(charge)
    .then(() => {
      this.snack.open(this.i18n.nativeElement.childNodes[0].textContent, 'X', { duration: 3000 });
      this.isLoading = false;
      this.dialogRef.close();
    }).catch(() => {
      this.snack.open(this.i18n.nativeElement.childNodes[1].textContent, 'X', { duration: 3000 });
      this.isLoading = false;
    });
  }
}
