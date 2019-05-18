import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import {
  MatSnackBar,
  MatStepper,
  MatSelectChange,
  MatSlideToggle,
  MatSelect
} from '@angular/material';
import {
  AngularFireStorage,
  AngularFireStorageReference,
  AngularFireUploadTask
} from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase/app';
import { map, takeUntil } from 'rxjs/operators';

import {
  Client,
  Pack,
  PackWithId,
  SubscriptionWithId,
  Subscription,
  Payment
} from 'src/app/shared/client.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-client-add',
  templateUrl: './client-add.component.html',
  styleUrls: ['./client-add.component.css']
})
export class ClientAddComponent implements OnInit, OnDestroy {
  @ViewChild('i18n') public i18n: ElementRef;
  @ViewChild('f') form: NgForm;
  @ViewChild('stepper') stepper: MatStepper;
  photoUrl = '';
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
  private ngUnsubscribe = new Subject();

  constructor(
    private storage: AngularFireStorage,
    private snack: MatSnackBar,
    private afs: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.afs
      .collection<Pack>('packs')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as Pack;
            const id = a.payload.doc.id;
            return { id, ...data } as PackWithId;
          })
        ),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        data => (this.packs = data),
        () =>
          this.snack.open(
            this.i18n.nativeElement.childNodes[0].textContent,
            'X',
            { duration: 3000 }
          )
      );
  }

  onSubmit(f: NgForm) {
    let client: Client = JSON.parse(JSON.stringify(f.value));
    client = {
      ...client,
      ...JSON.parse(JSON.stringify(f.value.id)),
      ...JSON.parse(JSON.stringify(f.value.subsInfo)),
      registrationDate: firestore.Timestamp.fromDate(
        f.value.id.registrationDate
      )
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
        name:
          client.name.first_lowercase.replace(/\s+/g, '-') +
          '-' +
          client.name.last_lowercase.replace(/\s+/g, '-') +
          '-' +
          client.pack.idSubscription.slice(0, 4),
        subscriberIds: [clientId]
      };
    } else {
      subscription = {
        subscriberIds: [
          ...this.subscriptions.filter(
            s => s.id === client.pack.idSubscription
          )[0].subscriberIds,
          clientId
        ]
      };
    }
    const batch = this.afs.firestore
      .batch()
      .set(this.afs.doc<Client>(`clients/${clientId}`).ref, client)
      .set(
        this.afs.doc<Subscription>(
          `packs/${client.pack.idPack}/subscriptions/${
            client.pack.idSubscription
          }`
        ).ref,
        subscription,
        { merge: true }
      );
    if (f.value.subsInfo.pack.idSubscription === 'new') {
      batch.set(this.afs.doc<Payment>(`payments/${this.afs.createId()}`).ref, {
        idClient: clientId,
        idSubscription: client.pack.idSubscription,
        price: this.selectedPrice - (client.insurance ? 100 : 0),
        date: client.registrationDate,
        note: 'subscription'
      });
    }
    if (client.insurance) {
      batch.set(this.afs.doc<Payment>(`payments/${this.afs.createId()}`).ref, {
        idClient: clientId,
        idSubscription: client.pack.idSubscription,
        price: 100,
        date: client.registrationDate,
        note: 'insurance'
      });
    }
    batch
      .commit()
      .then(() => {
        this.snack.open(
          this.i18n.nativeElement.childNodes[1].textContent,
          'X',
          { duration: 3000 }
        );
        this.form.resetForm();
        this.downloadUrl = '';
        this.router.navigate(['manager', 'clients', clientId]);
      })
      .catch(() =>
        this.snack
          .open(
            this.i18n.nativeElement.childNodes[2].textContent,
            this.i18n.nativeElement.childNodes[3].textContent,
            { duration: 4000 }
          )
          .onAction()
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => this.onSubmit(f))
      );
  }

  uploadPhoto(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (!file) {
      return;
    }
    this.isUploading = true;
    const filePath = 'images/' + Date.now().valueOf() + file.name;
    this.task = this.storage.upload(filePath, file);
    this.task
      .percentageChanges()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(pct => (this.uploadPct = pct));
    this.task
      .then(t => {
        this.photoUrl = t.ref.fullPath;
        this.fileRef = this.storage.ref(this.photoUrl);
        this.fileRef
          .getDownloadURL()
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(url => (this.downloadUrl = url));
        this.snack.open(
          this.i18n.nativeElement.childNodes[4].textContent,
          'X',
          { duration: 3000 }
        );
        this.isUploading = false;
      })
      .catch(() => {
        this.snack.open(
          this.i18n.nativeElement.childNodes[5].textContent,
          'X',
          { duration: 3000 }
        );
        this.isUploading = false;
      });
    (event.target as HTMLInputElement).value = '';
  }

  deletePhoto() {
    this.fileRef
      .delete()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        () => {
          this.snack.open(
            this.i18n.nativeElement.childNodes[6].textContent,
            'X',
            { duration: 3000 }
          );
          this.photoUrl = '';
          this.downloadUrl = '';
        },
        () =>
          this.snack.open(
            this.i18n.nativeElement.childNodes[8].textContent,
            'X',
            { duration: 3000 }
          )
      );
  }

  cancelUpload() {
    if (this.task.cancel()) {
      this.isPaused = false;
      this.photoUrl = '';
    }
  }

  onSelectPack(event: MatSelectChange) {
    if (event.value) {
      this.afs
        .collection<Subscription>(`packs/${event.value}/subscriptions`)
        .snapshotChanges()
        .pipe(
          map(actions =>
            actions.map(a => {
              const data = a.payload.doc.data() as Subscription;
              const id = a.payload.doc.id;
              return { id, ...data } as SubscriptionWithId;
            })
          ),
          takeUntil(this.ngUnsubscribe)
        )
        .subscribe(data => (this.subscriptions = data));
      this.selectedPrice = this.packs.filter(
        p => p.id === event.value
      )[0].price;
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
      this.selectedPrice = this.packs.filter(
        p => p.id === this.packSelect.value
      )[0].price;
    }
    this.insurance.checked = this.form.value.subsInfo.insurance = false;
  }

  onSelectInsurance() {
    this.selectedPrice += this.insurance.checked ? 100 : -100;
  }

  canDeactivate(): boolean {
    if (
      this.form.dirty &&
      !confirm(this.i18n.nativeElement.childNodes[7].textContent)
    ) {
      return false;
    }
    if (this.downloadUrl) {
      console.log('delete photo');
      this.fileRef
        .delete()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe();
    }
    return true;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any) {
  //   if (this.form.dirty) {
  //       $event.returnValue = true;
  //   }
  // }
}
