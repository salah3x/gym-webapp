import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { Pack, Subscription, PackWithId } from 'src/app/shared/client.model';
import { PackAddComponent } from './pack-add/pack-add.component';

@Component({
  selector: 'app-packs',
  templateUrl: './packs.component.html',
  styleUrls: ['./packs.component.css']
})
export class PacksComponent implements OnInit, OnDestroy {

  @ViewChild('i18n') public i18n: ElementRef;
  packs: PackWithId[];
  subscriptions: Observable<Subscription[]>;
  isLoading = true;
  displayedColumns: string[] = ['name', 'subscriberIds'];
  private ngUnsubscribe = new Subject();

  constructor(private afs: AngularFirestore,
              private dialog: MatDialog,
              private snack: MatSnackBar,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.afs.collection<Pack>('packs').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Pack;
        const id = a.payload.doc.id;
        return { id, ...data } as PackWithId;
      })),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(
      data => {
        this.packs = data;
        this.isLoading = false;
      },
      () => {
        this.snack.open(this.i18n.nativeElement.childNodes[0].textContent, 'X', { duration: 3000 });
        this.isLoading = false;
      });
  }

  openNewPackDialog() {
    this.dialog.open(PackAddComponent, {
      width: '400px'
    });
  }

  deletePack(idPack: string) {
    if (idPack === 'Rlt5JOspNeWlfFIJVWc0' || idPack === 'ZYQoxr3bHe8bGD3WZfCF') {
      this.snack.open(this.i18n.nativeElement.childNodes[1].textContent, 'X', { duration: 3000 });
      return;
    }
    if (confirm(this.i18n.nativeElement.childNodes[4].textContent)) {
      this.afs.collection<Subscription>(`packs/${idPack}/subscriptions`).valueChanges()
        .pipe(take(1)).subscribe(data => {
        if (!data.length) {
          this.afs.doc(`packs/${idPack}`).delete()
            .then(() => this.snack.open(this.i18n.nativeElement.childNodes[2].textContent, 'X', { duration: 3000 }));
        } else {
          this.snack.open(this.i18n.nativeElement.childNodes[3].textContent, 'X', { duration: 3000 });
        }
      });
    }
  }
  getSubscriptions(idPack: string) {
    this.subscriptions = this.afs.collection<Subscription>(`packs/${idPack}/subscriptions`).valueChanges();
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
