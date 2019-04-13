import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('i18n') public i18n: ElementRef;

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
      this.snack.open(this.i18n.nativeElement.childNodes[0].textContent, 'X', { duration: 3000 });
      this.isLoading = false;
      this.dialogRef.close();
    }).catch(() => {
      this.snack.open(this.i18n.nativeElement.childNodes[1].textContent, 'X', { duration: 3000 });
      this.isLoading = false;
    });
  }
}
