import { NgModule } from '@angular/core';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { ManagerRoutingModule } from './manager-routing.module';
import { ManagerComponent } from './manager.component';
import { ClientsComponent } from './clients/clients.component';
import { SharedModule } from '../shared/shared.module';
import { ProfileComponent } from './clients/profile/profile.component';
import { RemoveItemPipe } from './clients/profile/remove-item.pipe';
import { PaymentAddComponent } from './clients/profile/payment-add/payment-add.component';
import { CheckInsComponent } from './clients/profile/check-ins/check-ins.component';
import { ClientService } from './clients/client-service.service';
import { InfoEditComponent } from './clients/profile/info-edit/info-edit.component';

@NgModule({
  declarations: [
    ManagerComponent,
    ClientsComponent,
    ProfileComponent,
    RemoveItemPipe,
    PaymentAddComponent,
    CheckInsComponent,
    InfoEditComponent
  ],
  imports: [
    SharedModule,
    ManagerRoutingModule,
    AngularFireStorageModule,
    AngularFirestoreModule
  ],
  providers: [
    ClientService,
    { provide: FirestoreSettingsToken, useValue: {} }
  ],
  entryComponents: [PaymentAddComponent, InfoEditComponent]
})
export class ManagerModule { }
