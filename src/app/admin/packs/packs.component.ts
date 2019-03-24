import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Pack, Subscription, PackWithId } from 'src/app/shared/client.model';
import { PackAddComponent } from './pack-add/pack-add.component';

@Component({
  selector: 'app-packs',
  templateUrl: './packs.component.html',
  styleUrls: ['./packs.component.css']
})
export class PacksComponent implements OnInit {

  packs: PackWithId[];
  subscriptions: Observable<Subscription[]>;
  displayedColumns: string[] = ['name', 'subscriberIds'];

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
      }))
    ).subscribe(data => this.packs = data);
  }

  openNewPackDialog() {
    this.dialog.open(PackAddComponent, {
      width: '400px'
    });
  }

  deletePack(idPack: string) {
    if (idPack === 'Rlt5JOspNeWlfFIJVWc0' || idPack === 'ZYQoxr3bHe8bGD3WZfCF') {
      this.snack.open('Cannot delete essential packs', 'Close', { duration: 3000 });
      return;
    }
    if (confirm('Are you sure ?')) {
      this.afs.collection<Subscription>(`packs/${idPack}/subscriptions`).valueChanges()
        .pipe(take(1)).subscribe(data => {
        if (!data.length) {
          this.afs.doc(`packs/${idPack}`).delete()
            .then(() => this.snack.open('Pack deleted successufully', 'Close', { duration: 3000 }));
        } else {
          this.snack.open('Deletion failed, pack has active subscriptions', 'Close', { duration: 3000 });
        }
      });
    }
  }
  getSubscriptions(idPack: string) {
    this.subscriptions = this.afs.collection<Subscription>(`packs/${idPack}/subscriptions`).valueChanges();
  }

  toHtml(text: string) {
    if (!text || !text.length) {
      return '<i>No description</i>';
    }
    return this.sanitizer.bypassSecurityTrustHtml(text.replace(/\n/g, '<br>'));
  }
}
