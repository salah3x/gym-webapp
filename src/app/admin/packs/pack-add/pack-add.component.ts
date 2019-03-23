import { Component, OnInit } from '@angular/core';
import { Pack } from 'src/app/shared/client.model';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-pack-add',
  templateUrl: './pack-add.component.html',
  styleUrls: ['./pack-add.component.css']
})
export class PackAddComponent implements OnInit {

  isLoading = false;

  constructor(private afs: AngularFirestore,
              private dialogRef: MatDialogRef<PackAddComponent>,
              private snack: MatSnackBar) { }

  ngOnInit() {
  }

  onSubmit(f: NgForm) {
    this.isLoading = true;
    const pack: Pack = f.value;
    this.afs.collection<Pack>('packs').add(pack)
    .then(() => {
      this.snack.open('Pack saved successfully', 'Close', { duration: 2000 });
      this.isLoading = false;
      this.dialogRef.close();
    }).catch(() => {
      this.snack.open('Failed saving', 'Close', { duration: 2000 });
      this.isLoading = false;
    });
  }
}
