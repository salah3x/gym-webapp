import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take, takeUntil, mergeMap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import {
  Pack,
  Subscription,
  PackWithId,
  SubscriptionWithId
} from '../../shared/client.model';
import { PackAddComponent } from './pack-add/pack-add.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-packs',
  templateUrl: './packs.component.html',
  styleUrls: ['./packs.component.css']
})
export class PacksComponent implements OnInit, OnDestroy {
  @ViewChild('i18n') public i18n: ElementRef;
  packs: PackWithId[];
  subscriptions: Observable<SubscriptionWithId[]>;
  isLoading = true;
  displayedColumns: string[] = ['name', 'subscriberIds', 'delete'];
  private ngUnsubscribe = new Subject();
  deleting = false;

  constructor(
    private afs: AngularFirestore,
    private auth: AngularFireAuth,
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private sanitizer: DomSanitizer
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
        data => {
          this.packs = data;
          this.isLoading = false;
        },
        () => {
          this.snack.open(
            this.i18n.nativeElement.childNodes[0].textContent,
            'X',
            { duration: 3000 }
          );
          this.isLoading = false;
        }
      );
  }

  openNewPackDialog() {
    this.dialog.open(PackAddComponent, {
      width: '400px'
    });
  }

  deletePack(idPack: string) {
    if (
      idPack === 'Rlt5JOspNeWlfFIJVWc0' ||
      idPack === 'ZYQoxr3bHe8bGD3WZfCF'
    ) {
      this.snack.open(this.i18n.nativeElement.childNodes[1].textContent, 'X', {
        duration: 3000
      });
      return;
    }
    if (confirm(this.i18n.nativeElement.childNodes[4].textContent)) {
      this.afs
        .collection<Subscription>(`packs/${idPack}/subscriptions`)
        .valueChanges()
        .pipe(take(1))
        .subscribe(data => {
          if (!data.length) {
            this.afs
              .doc(`packs/${idPack}`)
              .delete()
              .then(() =>
                this.snack.open(
                  this.i18n.nativeElement.childNodes[2].textContent,
                  'X',
                  { duration: 3000 }
                )
              );
          } else {
            this.snack.open(
              this.i18n.nativeElement.childNodes[3].textContent,
              'X',
              { duration: 3000 }
            );
          }
        });
    }
  }

  deleteSubscription(idPack: string, idSubscription: string) {
    if (confirm(this.i18n.nativeElement.childNodes[6].textContent)) {
      this.deleting = true;
      this.auth.idToken
        .pipe(
          mergeMap(t =>
            this.http.post(environment.adminApi + 'deleteSubscription', {
              token: t,
              idPack,
              idSubscription
            })
          ),
          take(1)
        )
        .subscribe(
          () => {
            this.snack.open(
              this.i18n.nativeElement.childNodes[7].textContent,
              'X',
              { duration: 3000 }
            );
            this.deleting = false;
          },
          () => {
            this.deleting = false;
            this.snack.open(
              this.i18n.nativeElement.childNodes[8].textContent,
              'X',
              { duration: 3000 }
            );
          }
        );
    }
  }

  editPack(id: string) {
    this.dialog.open(PackAddComponent, {
      width: '400px',
      data: { id }
    });
  }

  getSubscriptions(idPack: string) {
    this.subscriptions = this.afs
      .collection<Subscription>(`packs/${idPack}/subscriptions`)
      .snapshotChanges()
      .pipe(
        map(ss =>
          ss.map(s => {
            const data = s.payload.doc.data() as Subscription;
            const id = s.payload.doc.id;
            return { id, ...data } as SubscriptionWithId;
          })
        )
      );
  }

  toHtml(text: string) {
    if (!text || !text.length) {
      return `<i>${this.i18n.nativeElement.childNodes[5].textContent}</i>`;
    }
    return this.sanitizer.bypassSecurityTrustHtml(text.replace(/\n/g, '<br>'));
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
