import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';

import { ClientWithId, Client } from 'src/app/shared/client.model';

@Component({
  selector: 'app-info-edit',
  templateUrl: './info-edit.component.html',
  styleUrls: ['./info-edit.component.css']
})
export class InfoEditComponent implements OnInit {

  @ViewChild('i18n') public i18n: ElementRef;
  loading = false;
  @ViewChild('f') form: NgForm;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ClientWithId,
              private afs: AngularFirestore,
              private snack: MatSnackBar,
              private dialogRef: MatDialogRef<InfoEditComponent>) { }

  ngOnInit() {
    setTimeout(() => this.form.setValue({
      name: {
        first: this.data.name.first,
        last: this.data.name.last
      },
      cin: this.data.cin,
      phone: this.data.phone,
      address: this.data.address,
      note: this.data.note
    }), 700);
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.loading = true;
    this.afs.doc<Client>(`clients/${this.data.id}`).update({
      ...this.form.value,
      name: {
        ...this.form.value.name,
        first_lowercase: this.form.value.name.first.toLowerCase(),
        last_lowercase: this.form.value.name.last.toLowerCase(),
      },
      cin: this.form.value.cin.toLowerCase()
    })
      .then(() => {
        this.loading = false;
        this.snack.open(this.i18n.nativeElement.childNodes[0].textContent, 'X', { duration: 3000 });
        this.dialogRef.close();
      }).catch(() => {
        this.loading = false;
        this.snack.open(this.i18n.nativeElement.childNodes[1].textContent, 'X', { duration: 3000 });
      });
  }
}
