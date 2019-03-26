import { NgModule } from '@angular/core';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { ManagerRoutingModule } from './manager-routing.module';
import { ManagerComponent } from './manager.component';
import { ClientsComponent } from './clients/clients.component';
import { SharedModule } from '../shared/shared.module';
import { ProfileComponent } from './clients/profile/profile.component';
import { RemoveItemPipe } from './clients/profile/remove-item.pipe';

@NgModule({
  declarations: [
    ManagerComponent,
    ClientsComponent,
    ProfileComponent,
    RemoveItemPipe
  ],
  imports: [
    SharedModule,
    ManagerRoutingModule,
    AngularFireStorageModule,
    AngularFirestoreModule
  ],
  providers: [
    { provide: FirestoreSettingsToken, useValue: {} }
  ]
})
export class ManagerModule { }
