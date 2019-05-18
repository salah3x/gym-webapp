import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

import { Pack } from 'src/app/shared/client.model';

@Component({
  selector: 'app-pack-add',
  templateUrl: './pack-add.component.html',
  styleUrls: ['./pack-add.component.css']
})
export class PackAddComponent implements OnInit {
  editMode: boolean;
  isLoading = false;
  @ViewChild('f') form: NgForm;
  @ViewChild('i18n') public i18n: ElementRef;

  constructor(
    private afs: AngularFirestore,
    private dialogRef: MatDialogRef<PackAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.editMode = this.data && !!this.data.id;
    if (this.editMode) {
      this.afs
        .doc(`packs/${this.data.id}`)
        .valueChanges()
        .pipe(take(1))
        .subscribe(p => this.form.setValue(p));
    }
  }

  onSubmit(f: NgForm) {
    this.isLoading = true;
    const pack: Pack = f.value;
    let p: Promise<any>;
    if (this.editMode) {
      p = this.afs.doc<Pack>(`packs/${this.data.id}`).update(pack);
    } else {
      p = this.afs.collection<Pack>('packs').add(pack);
    }

    p.then(() => {
      this.snack.open(this.i18n.nativeElement.childNodes[0].textContent, 'X', {
        duration: 3000
      });
      this.isLoading = false;
      this.dialogRef.close();
    }).catch(() => {
      this.snack.open(this.i18n.nativeElement.childNodes[1].textContent, 'X', {
        duration: 3000
      });
      this.isLoading = false;
    });
  }
}
