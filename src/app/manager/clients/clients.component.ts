import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Subject, of, combineLatest } from 'rxjs';
import { switchMap, map, distinct, debounceTime } from 'rxjs/operators';

import { ClientWithId, Client } from 'src/app/shared/client.model';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  searchTerm = new Subject<string>();
  clients: ClientWithId[];
  displayedColumns = ['photo', 'name', 'action'];
  isLoading = false;

  constructor(private afs: AngularFirestore,
              private snack: MatSnackBar,
              private storage: AngularFireStorage) { }

  ngOnInit() {
    this.searchTerm.pipe(
      debounceTime(1000),
      switchMap(s => {
        if (!s.trim()) {
          return of([[], [], []]);
        }
        console.log('Searching for :', s);
        const firstNameRef = this.afs.collection<Client>('clients', ref => ref.orderBy('name.first_lowercase')
          .startAt(s).endAt(s + '\uf8ff'));
        const lastNameRef = this.afs.collection<Client>('clients', ref => ref.orderBy('name.last_lowercase')
          .startAt(s).endAt(s + '\uf8ff'));
        const cinRef = this.afs.collection<Client>('clients', ref => ref.orderBy('cin')
          .startAt(s).endAt(s + '\uf8ff'));
        return combineLatest(firstNameRef.snapshotChanges(),
          lastNameRef.snapshotChanges(),
          cinRef.snapshotChanges());
      }),
      switchMap(clients => {
        const [firstNames, lastName, cin] = clients;
        const combined = firstNames.concat(lastName, cin);
        return of(combined);
      }),
      map(actions => actions
        .map(a => {
          const data = a.payload.doc.data() as Client;
          const id = a.payload.doc.id;
          return { id, ...data } as ClientWithId;
        })
      ),
      map(array => Array.from(new Set(array.map(c => c.id)))
        .map(id => array.find(c => c.id === id))
        .sort((a, b) => a.name.first.localeCompare(b.name.first))
      ),
      map(data => {
        data.map(c => c.photo = (this.storage.ref(c.photo).getDownloadURL() as unknown as string));
        return data;
      })
    ).subscribe(data => {
      this.clients = data;
      this.isLoading = false;
    }, err => {
      this.snack.open('Connexion failed', 'Close', { duration: 2000 });
      this.isLoading = false;
    });
  }

  search(s: string) {
    this.isLoading = true;
    s = s.toLowerCase();
    this.clients = [];
    this.searchTerm.next(s);
  }

  performCheckin(id: string) {
    // this.afs.collection(`clients/${id}/checkins`, ref => ref.where('date' ,'>='))
  }
}
