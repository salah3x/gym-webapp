import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subject, of, combineLatest } from 'rxjs';
import { switchMap, map, debounceTime, tap, takeUntil } from 'rxjs/operators';

import { ClientWithId, Client } from 'src/app/shared/client.model';
import { ClientService } from './client-service.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit, OnDestroy {

  @ViewChild('i18n') public i18n: ElementRef;
  searchTerm = new Subject<string>();
  clients: ClientWithId[];
  displayedColumns = ['photo', 'name', 'action', 'state'];
  isLoading = false;
  isCheckingIn = false;
  private ngUnsubscribe = new Subject();

  constructor(private afs: AngularFirestore,
              private snack: MatSnackBar,
              private service: ClientService) { }

  ngOnInit() {
    this.service.i18n = this.i18n;
    this.searchTerm.pipe(
      tap(s => s.trim() ? this.isLoading = true : this.isLoading = false),
      debounceTime(1000),
      switchMap(s => {
        if (!s.trim()) {
          return of([[], [], []]);
        }
        if (s === ':all') {
          return combineLatest(
            this.afs.collection<Client>('clients', ref => ref.orderBy('name.first_lowercase')).snapshotChanges(),
            of([]),
            of([]));
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
        // .sort((a, b) => a.name.first.localeCompare(b.name.first))
      ),
      map(data => {
        data.map(c => {
          // Add .url & .payed as placeholders for some observables
          (c as any).url = this.service.getUrl(c.photo, c.sex);
          (c as any).payed = this.service.hasPayed(c.pack.idSubscription);
        });
        return data;
      }),
      takeUntil(this.ngUnsubscribe)
    ).subscribe(data => {
      this.clients = data;
      this.isLoading = false;
    }, () => {
      this.snack.open(this.i18n.nativeElement.childNodes[0].textContent, 'X', { duration: 2000 });
      this.isLoading = false;
    });
  }

  search(s: string) {
    s = s.toLowerCase();
    this.clients = [];
    this.searchTerm.next(s);
  }

  performCheckin(id: string) {
    this.service.performCheckin(id, this.isCheckingIn);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
