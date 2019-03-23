import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { MatSnackBar, MatStepper, MatSelectChange } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Client, Pack, PackWithId, SubscriptionWithId, Subscription } from 'src/app/shared/client.model';

@Component({
  selector: 'app-client-add',
  templateUrl: './client-add.component.html',
  styleUrls: ['./client-add.component.css']
})
export class ClientAddComponent implements OnInit {

  @ViewChild('f') form: NgForm;
  @ViewChild('stepper') stepper: MatStepper;
  photoUrl: string;
  downloadUrl: string;
  isUploading = false;
  uploadPct = 0;
  isPaused = false;
  fileRef: AngularFireStorageReference;
  task: AngularFireUploadTask;
  packs: Observable<PackWithId[]>;
  subscriptions: Observable<SubscriptionWithId[]>;

  constructor(private storage: AngularFireStorage,
              private snack: MatSnackBar,
              private afs: AngularFirestore) { }

  ngOnInit() {
    this.packs = this.afs.collection<Pack>('packs').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Pack;
        const id = a.payload.doc.id;
        return { id, ...data } as PackWithId;
      }))
    );
  }

  onSubmit() {
    let client: Client = this.form.value;
    client = {
      ...client,
      ...this.form.value.id,
      ...this.form.value.subsInfo,
      registrationDate: firestore.Timestamp.fromDate(this.form.value.id.registrationDate)
    };
    delete (client as any).id;
    delete (client as any).subsInfo;
    console.log(client);
    this.stepper.reset();
    this.form.resetForm();
    this.photoUrl = undefined;
    this.downloadUrl = undefined;
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

  onSelectPack(event: MatSelectChange) {
    if (event.value) {
      this.subscriptions = this.afs.collection<Subscription>(`packs/${event.value}/subscriptions`).snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Subscription;
          const id = a.payload.doc.id;
          return { id, ...data } as SubscriptionWithId;
        }))
      );
    } else {
      this.subscriptions = null;
    }
  }

  canDeactivate(): boolean {
    if (this.form.dirty && !confirm('Discard changes ?')) {
      return false;
    }
    if (this.downloadUrl) {
      this.fileRef.delete().subscribe();
    }
    return true;
  }

  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any) {
  //   if (this.form.dirty) {
  //       $event.returnValue = true;
  //   }
  // }
}
