import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { firestore } from 'firebase/app';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { Client, ClientWithId, Pack, Payment, Subscription } from 'src/app/shared/client.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  client: ClientWithId;
  isLoading = true;

  constructor(private route: ActivatedRoute,
              private afs: AngularFirestore,
              private sanitizer: DomSanitizer,
              private storage: AngularFireStorage) { }

  ngOnInit() {
    const id = this.route.snapshot.params.id;
    this.afs.doc<Client>(`clients/${id}`).valueChanges()
      .pipe(
        // add a url field with an observable of dawnload url
        // add a pack field with an observable of the pack object
        // add a subscription field with an observable of the subscription object
        map(c => {
          (c as any).url = this.storage.ref(c.photo).getDownloadURL().pipe(
          catchError(() => of(c.sex === 'f' ? '/assets/default-profile-female.png' :
            '/assets/default-profile-male.png')));
          (c.pack as any).pack = this.afs.doc<Pack>(`packs/${c.pack.idPack}`).valueChanges();
          const date = new Date();
          date.setMonth(date.getMonth() - 1);
          (c as any).payed = this.afs.collection<Payment>('payments', ref => ref.where('idSubscription', '==', c.pack.idSubscription)
            .where('date', '>=', firestore.Timestamp.fromDate(date)))
            .valueChanges().pipe(
              map(ps => ps.filter(p => p.note.toLowerCase().search('registration') !== -1).length !== 0),
              map(p => p ? 'yes' : 'no')
            );
          (c.pack as any).subscription = this.afs.doc<Subscription>(`packs/${c.pack.idPack}/subscriptions/${c.pack.idSubscription}`)
            .valueChanges();
          return c;
        }
      )).subscribe(
        c => { this.isLoading = false; this.client = {...c, id}; },
        () => this.isLoading = false
      );
  }

  toHtml(text: string) {
    if (!text || !text.length) {
      return '<i>Not provided</i>';
    }
    return this.sanitizer.bypassSecurityTrustHtml(('<i>' + text + '</i>').replace(/\n/g, '<br>'));
  }
}
