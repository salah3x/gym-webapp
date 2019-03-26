import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Subject, of, combineLatest } from 'rxjs';
import { switchMap, map, debounceTime, take, catchError } from 'rxjs/operators';
import { firestore } from 'firebase/app';

import { ClientWithId, Client, CheckIn, Payment } from 'src/app/shared/client.model';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  searchTerm = new Subject<string>();
  clients: ClientWithId[];
  displayedColumns = ['photo', 'name', 'action', 'state'];
  isLoading = false;
  isCheckingIn = false;

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
        data.map(c => {
          // Add .url & .payed as placeholders for some observables
          (c as any).url = this.storage.ref(c.photo).getDownloadURL().pipe(catchError(() =>
            of(c.sex === 'f' ? '/assets/default-profile-female.png' : '/assets/default-profile-male.png')));
          const date = new Date();
          date.setMonth(date.getMonth() - 1);
          (c as any).payed = this.afs.collection<Payment>('payments', ref => ref.where('idSubscription', '==', c.pack.idSubscription)
            .where('date', '>=', firestore.Timestamp.fromDate(date)))
            .valueChanges().pipe(
              map(ps => ps.filter(p => p.note.toLowerCase().search('registration') !== -1).length !== 0),
              map(p => p ? 'yes' : 'no')
            );
        });
        return data;
      })
    ).subscribe(data => {
      this.clients = data;
      this.isLoading = false;
    }, () => {
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

  performCheckin(id: string, withNote: boolean = false) {
    this.isCheckingIn = true;
    this.afs.collection<CheckIn>(`clients/${id}/checkins`, ref => ref
      .where('date', '>=', firestore.Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0))))
      .where('date', '<=', firestore.Timestamp.fromDate(new Date())))
      .valueChanges().pipe(take(1)).subscribe(data => {
        if (!data.length || confirm('This client has already checked in today.\nCheck in anyway ?')) {
          const note = withNote ? prompt('Optional note :') : '';
          this.afs.collection<CheckIn>(`clients/${id}/checkins`).add({
            date: firestore.Timestamp.fromDate(new Date()),
            note,
          }).then(() => {
            this.snack.open('Checked in successfully', 'Close', { duration: 2000 });
            this.isCheckingIn = false;
          }).catch(() => {
            this.snack.open('Check in failed', 'Close', { duration: 2000 });
            this.isCheckingIn = false;
          });
        } else {
          this.isCheckingIn = false;
        }
      }, () => {
        this.isCheckingIn = false;
        this.snack.open('Check in failed', 'Close', { duration: 2000 });
      });
  }
}
