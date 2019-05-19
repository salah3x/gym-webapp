import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {
  AngularFirestoreModule,
  FirestoreSettingsToken
} from '@angular/fire/firestore';
import { ChartsModule } from 'ng2-charts';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { PacksComponent } from './packs/packs.component';
import { ClientAddComponent } from './client-add/client-add.component';
import { SharedModule } from '../shared/shared.module';
import { CanDeactivateClient } from './client-add/can-deactivate-client.service';
import { PackAddComponent } from './packs/pack-add/pack-add.component';
import { ChargesPaymentsComponent } from './charges-payments/charges-payments.component';
import { ChargeAddComponent } from './charges-payments/charge-add/charge-add.component';
import { ListViewComponent } from './charges-payments/list-view/list-view.component';

@NgModule({
  declarations: [
    AdminComponent,
    PacksComponent,
    ClientAddComponent,
    PackAddComponent,
    ChargesPaymentsComponent,
    ChargeAddComponent,
    ListViewComponent
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    AngularFirestoreModule,
    HttpClientModule,
    ChartsModule
  ],
  providers: [
    CanDeactivateClient,
    { provide: FirestoreSettingsToken, useValue: {} }
  ],
  entryComponents: [PackAddComponent, ChargeAddComponent, ListViewComponent]
})
export class AdminModule {}
