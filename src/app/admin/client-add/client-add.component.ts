import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-client-add',
  templateUrl: './client-add.component.html',
  styleUrls: ['./client-add.component.css']
})
export class ClientAddComponent implements OnInit {

  photoUrl: string;
  downloadUrl: string;
  isUploading = false;
  uploadPct = 0;
  isPaused = false;
  fileRef: AngularFireStorageReference;
  task: AngularFireUploadTask;

  constructor(private storage: AngularFireStorage,
              private snack: MatSnackBar) { }

  ngOnInit() {
  }

  onSubmit(f: NgForm) {
    console.log(f.value);
  }

  uploadPhoto(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (!file) {
      return;
    }
    this.isUploading = true;
    const filePath = 'images/' + Date.now().valueOf() + file.name;
    this.fileRef = this.storage.ref(filePath);
    this.task = this.storage.upload(filePath, file);
    this.task.percentageChanges().subscribe(pct => this.uploadPct = pct);
    this.task.snapshotChanges().pipe(
      finalize(() => this.fileRef.getDownloadURL().subscribe(url => this.downloadUrl = url))
    ).subscribe();
    this.task.then(t => {
      this.photoUrl = t.ref.fullPath;
      this.snack.open('Upload finished successfully', 'Close', { duration: 2000 });
      this.isUploading = false;
    }).catch(() => {
      this.snack.open('Upload failed', 'Retry', { duration: 6000 })
        .onAction().subscribe(() => this.uploadPhoto(event));
      this.isUploading = false;
    });
    (event.target as HTMLInputElement).value = null;
  }

  deletePhoto() {
    if (this.photoUrl) {
      this.fileRef.delete().subscribe(() => {
        this.snack.open('Photo deleted successfully', 'Close', { duration: 2000 });
        this.photoUrl = undefined;
        this.downloadUrl = undefined;
      });
    }
  }

  cancelUpload() {
    if (this.task.cancel()) {
      this.isPaused = false;
      this.photoUrl = undefined;
    }
  }
}
