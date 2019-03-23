import { NgModule } from '@angular/core';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { PacksComponent } from './packs/packs.component';
import { ClientAddComponent } from './client-add/client-add.component';
import { SharedModule } from '../shared/shared.module';
import { CanDeactivateClient } from './client-add/can-deactivate-client.service';
import { PackAddComponent } from './packs/pack-add/pack-add.component';

@NgModule({
  declarations: [
    AdminComponent,
    PacksComponent,
    ClientAddComponent,
    PackAddComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    AngularFireStorageModule,
    AngularFirestoreModule
  ],
  providers: [
    CanDeactivateClient,
    { provide: FirestoreSettingsToken, useValue: {} }
  ],
  entryComponents: [PackAddComponent]
})
export class AdminModule { }
