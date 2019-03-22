import { NgModule } from '@angular/core';
import { AngularFireStorageModule, StorageBucket } from '@angular/fire/storage';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { PacksComponent } from './packs/packs.component';
import { ClientAddComponent } from './client-add/client-add.component';
import { SharedModule } from '../shared/shared.module';
import { CanDeactivateClient } from './client-add/can-deactivate-client.service';

@NgModule({
  declarations: [
    AdminComponent,
    PacksComponent,
    ClientAddComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    AngularFireStorageModule
  ],
  providers: [
    CanDeactivateClient
  ]
})
export class AdminModule { }
