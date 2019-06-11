import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/firestore';
import { Client } from 'src/app/shared/client.model';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.css']
})
export class PhotoComponent implements OnInit {
  @ViewChild('i18n', { static: false }) public i18n: ElementRef;
  deletePhotoOnClose = true;
  loading = false;
  photoUrl = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    private afs: AngularFirestore,
    private dialogRef: MatDialogRef<PhotoComponent>
  ) {}

  ngOnInit() {}

  save() {
    this.loading = true;
    this.afs
      .doc<Client>(`clients/${this.data.id}`)
      .update({ photo: this.photoUrl })
      .then(() => {
        this.deletePhotoOnClose = false;
        this.dialogRef.close();
      })
      .finally(() => (this.loading = false));
  }

  onEnd(url: string) {
    this.photoUrl = url;
    this.loading = false;
  }
}
