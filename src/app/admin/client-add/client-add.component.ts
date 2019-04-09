import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from '@angular/fire/storage';
import { MatSnackBar, MatStepper, MatSelectChange, MatSlideToggle, MatSelect } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { finalize, map, take } from 'rxjs/operators';

import { Client, Pack, PackWithId, SubscriptionWithId, Subscription, Payment } from 'src/app/shared/client.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-client-add',
  templateUrl: './client-add.component.html',
  styleUrls: ['./client-add.component.css']
})
export class ClientAddComponent implements OnInit {

  @ViewChild('f') form: NgForm;
  @ViewChild('stepper') stepper: MatStepper;
  photoUrl: string;
  curentDate = new Date();
  downloadUrl: string;
  isUploading = false;
  uploadPct = 0;
  isPaused = false;
  fileRef: AngularFireStorageReference;
  task: AngularFireUploadTask;
  packs: PackWithId[];
  subscriptions: SubscriptionWithId[];
  selectedPrice = 0;
  @ViewChild('i') insurance: MatSlideToggle;
  @ViewChild('s') subSelect: MatSelect;
  @ViewChild('p') packSelect: MatSelect;

  constructor(private storage: AngularFireStorage,
              private snack: MatSnackBar,
              private afs: AngularFirestore,
              private router: Router) { }

  ngOnInit() {
    this.afs.collection<Pack>('packs').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Pack;
        const id = a.payload.doc.id;
        return { id, ...data } as PackWithId;
      }))
    ).subscribe(data => this.packs = data, () => this.snack.open('Failed loading packs information', 'Close', { duration: 3000 }));
  }

  onSubmit(f: NgForm) {
    let client: Client = JSON.parse(JSON.stringify(f.value));
    client = {
      ...client,
      ... JSON.parse(JSON.stringify(f.value.id)),
      ... JSON.parse(JSON.stringify(f.value.subsInfo)),
      registrationDate: firestore.Timestamp.fromDate(f.value.id.registrationDate)
    };
    delete (client as any).id;
    delete (client as any).subsInfo;
    if (!client.photo) {
      client.photo = '';
    }
    client.name.first_lowercase = client.name.first.toLowerCase().trim();
    client.name.last_lowercase = client.name.last.toLowerCase().trim();
    client.cin = client.cin.toLowerCase();
    const clientId = this.afs.createId();
    let subscription: Subscription;
    if (f.value.subsInfo.pack.idSubscription === 'new') {
      client.pack.idSubscription = this.afs.createId();
      subscription = {
        name: client.name.first_lowercase.replace(/\s+/g, '-')
        + '-' + client.name.last_lowercase.replace(/\s+/g, '-')
        + '-' + client.pack.idSubscription.slice(0, 4),
        subscriberIds: [clientId]
      };
    } else {
      subscription = {
        subscriberIds: [...this.subscriptions.filter(s => s.id === client.pack.idSubscription)[0].subscriberIds,
          clientId]
      };
    }
    const payment: Payment = {
      idClient: clientId,
      idSubscription: client.pack.idSubscription,
      price: this.selectedPrice,
      date:  client.registrationDate,
      note: (f.value.subsInfo.pack.idSubscription === 'new' ? 'Registration fee' : '') +
        (f.value.subsInfo.pack.idSubscription === 'new' && client.insurance ? ' + ' : '') +
        (client.insurance ? 'Insurance fee' : ''),
    };
    const batch = this.afs.firestore.batch()
      .set(this.afs.doc<Client>(`clients/${clientId}`).ref, client)
      .set(this.afs.doc<Subscription>(`packs/${client.pack.idPack}/subscriptions/${client.pack.idSubscription}`).ref,
        subscription, {merge: true});
    if (payment.price) {
      batch.set(this.afs.doc<Payment>(`payments/${this.afs.createId()}`).ref, payment);
    }
    batch.commit()
      .then(() => {
        this.snack.open('Client added successfully', 'Close', { duration: 3000 });
        this.form.resetForm();
        this.router.navigate(['manager', 'clients', clientId]);
      }).catch(() => this.snack.open('Failed registring client', 'Retry', { duration: 4000 })
          .onAction().subscribe(() => this.onSubmit(f)));
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
      this.snack.open('Upload finished successfully', 'Close', { duration: 3000 });
      this.isUploading = false;
    }).catch(() => {
      this.snack.open('Upload failed', 'Close', { duration: 3000 });
      this.isUploading = false;
    });
    (event.target as HTMLInputElement).value = '';
  }

  deletePhoto() {
    if (this.photoUrl) {
      this.fileRef.delete().subscribe(() => {
        this.snack.open('Photo deleted successfully', 'Close', { duration: 3000 });
        this.photoUrl = '';
        this.downloadUrl = '';
      });
    }
  }

  cancelUpload() {
    if (this.task.cancel()) {
      this.isPaused = false;
      this.photoUrl = '';
    }
  }

  onSelectPack(event: MatSelectChange) {
    if (event.value) {
      this.afs.collection<Subscription>(`packs/${event.value}/subscriptions`).snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Subscription;
          const id = a.payload.doc.id;
          return { id, ...data } as SubscriptionWithId;
        }))
      ).subscribe(data => this.subscriptions = data);
      this.selectedPrice = this.packs.filter(p => p.id === event.value)[0].price;
    } else {
      this.subscriptions = [];
      this.selectedPrice = 0;
    }
    this.subSelect.ngControl.control.setValue('new');
    this.insurance.checked = this.form.value.subsInfo.insurance = false;
  }

  onSelectSubscription(id: string) {
    if (id !== 'new') {
      this.selectedPrice = 0;
    } else {
      this.selectedPrice = this.packs.filter(p => p.id === this.packSelect.value)[0].price;
    }
    this.insurance.checked = this.form.value.subsInfo.insurance = false;
  }

  onSelectInsurance() {
    this.selectedPrice += this.insurance.checked ? 100 : -100;
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
