import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, tap, switchMap, takeUntil, mergeMap, take } from 'rxjs/operators';

import {
  Client,
  ClientWithId,
  Pack,
  Subscription,
  Payment
} from 'src/app/shared/client.model';
import { PaymentAddComponent } from './payment-add/payment-add.component';
import { ClientService } from '../client-service.service';
import { InfoEditComponent } from './info-edit/info-edit.component';
import { environment } from 'src/environments/environment';
import { PhotoComponent } from './photo/photo.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('i18n') public i18n: ElementRef;
  client: ClientWithId;
  isLoading = true;
  isCheckingIn = false;
  isAdmin = false;
  payments: Observable<Payment[]>;
  displayedColumns = ['date', 'price', 'note', 'by'];
  isDeleting = false;
  private ngUnsubscribe = new Subject();

  constructor(
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private storege: AngularFireStorage,
    private sanitizer: DomSanitizer,
    private auth: AngularFireAuth,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private service: ClientService,
    private titleService: Title,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.service.i18n = this.i18n;
    this.auth.idTokenResult
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(r =>
        r ? (r.claims ? (this.isAdmin = r.claims.admin) : false) : false
      );
    this.route.params
      .pipe(
        // Set id to undefined to rerender the app-check-ins component
        tap(() => this.client && (this.client.id = undefined)),
        switchMap(params =>
          this.afs.doc<Client>(`clients/${params.id}`).snapshotChanges()
        ),
        map(c => {
          const data = c.payload.data() as Client;
          const id = c.payload.id;
          return { id, ...data } as ClientWithId;
        }),
        // add a url field with an observable of dawnload url
        // add a payed field (if the client has payed this month's fee)
        // add a pack field with an observable of the pack object
        // add a subscription field with an observable of the subscription object
        map(c => {
          (c as any).url = this.service.getUrl(c.photo, c.sex);
          (c as any).payed = this.service.hasPayed(c.pack.idSubscription);
          (c.pack as any).pack = this.afs
            .doc<Pack>(`packs/${c.pack.idPack}`)
            .valueChanges();
          (c.pack as any).subscription = this.afs
            .doc<Subscription>(
              `packs/${c.pack.idPack}/subscriptions/${c.pack.idSubscription}`
            )
            .valueChanges();
          return c;
        }),
        // Get all payments of this client (for the past year)
        // payments are either made by the client or by someone else in the same subscription
        // Order the list by date
        tap(c => {
          this.payments = combineLatest(
            this.afs
              .collection<Payment>('payments', ref =>
                ref.where('idClient', '==', c.id)
              )
              .snapshotChanges(),
            this.afs
              .collection<Payment>('payments', ref =>
                ref
                  .where('idSubscription', '==', c.pack.idSubscription)
                  .where('note', '==', 'subscription')
              )
              .snapshotChanges()
          ).pipe(
            map(list => {
              const [first, second] = list;
              return first.concat(second);
            }),
            map(array =>
              Array.from(new Set(array.map(item => item.payload.doc.id))).map(
                id => array.find(item => item.payload.doc.id === id)
              )
            ),
            map(actions => actions.map(a => a.payload.doc.data())),
            map(ps =>
              ps.sort(
                (a, b) => b.date.toDate().getTime() - a.date.toDate().getTime()
              )
            )
          );
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe(
        c => {
          this.isLoading = false;
          this.client = c;
          this.titleService.setTitle(
            this.titleService.getTitle() +
              ' | ' +
              c.name.first +
              ' ' +
              c.name.last
          );
        },
        () => {
          this.isLoading = false;
          this.snack.open(
            this.i18n.nativeElement.childNodes[8].textContent,
            'X',
            { duration: 3000 }
          );
        }
      );
  }

  openPaymentDialog() {
    if (!this.isAdmin) {
      return;
    }
    this.dialog.open(PaymentAddComponent, {
      width: '350px',
      data: { ...this.client }
    });
  }

  openEditDialog() {
    if (!this.isAdmin) {
      return;
    }
    this.dialog.open(InfoEditComponent, {
      width: '500px',
      data: { ...this.client }
    });
  }

  performCheckin(id: string) {
    this.service.performCheckin(id, this.isCheckingIn);
  }

  deleteClient(id: string) {
    if (!this.isAdmin) {
      return;
    }
    if (confirm(this.i18n.nativeElement.childNodes[9].textContent)) {
      this.isDeleting = true;
      this.auth.idToken
        .pipe(
          mergeMap(t =>
            this.http.post(environment.adminApi + 'deleteClient', {
              token: t,
              id
            })
          ),
          take(1)
        )
        .subscribe(
          () => {
            this.snack.open(
              this.i18n.nativeElement.childNodes[10].textContent,
              'X',
              { duration: 3000 }
            );
            this.isDeleting = false;
            this.router.navigate(['/manager', 'clients']);
          },
          () => {
            this.isDeleting = false;
            this.snack.open(
              this.i18n.nativeElement.childNodes[11].textContent,
              'X',
              { duration: 3000 }
            );
          }
        );
    }
  }

  deletePhoto() {
    if (!this.isAdmin) {
      return;
    }
    if (confirm(this.i18n.nativeElement.childNodes[12].textContent + '?')) {
      this.storege
        .ref(this.client.photo)
        .delete()
        .toPromise()
        .then(() =>
          this.afs.doc(`clients/${this.client.id}`).update({ photo: '' })
        );
    }
  }

  uploadPhoto() {
    if (!this.isAdmin) {
      return;
    }
    this.dialog.open(PhotoComponent, {
      width: '70%',
      disableClose: true,
      data: { id: this.client.id }
    });
  }

  toHtml(text: string) {
    if (!text || !text.length) {
      return `<i>${this.i18n.nativeElement.childNodes[2].textContent}</i>`;
    }
    return this.sanitizer.bypassSecurityTrustHtml(
      ('<i>' + text + '</i>').replace(/\n/g, '<br>')
    );
  }

  ngOnDestroy() {
    this.titleService.setTitle(this.titleService.getTitle().split(' | ')[0]);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
