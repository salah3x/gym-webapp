import { NgModule } from '@angular/core';

import { ManagerRoutingModule } from './manager-routing.module';
import { ManagerComponent } from './manager.component';
import { ClientsComponent } from './clients/clients.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ManagerComponent,
    ClientsComponent
  ],
  imports: [
    SharedModule,
    ManagerRoutingModule
  ]
})
export class ManagerModule { }
