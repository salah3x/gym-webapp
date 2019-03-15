import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagerRoutingModule } from './manager-routing.module';
import { ManagerComponent } from './manager.component';
import { ClientsComponent } from './clients/clients.component';
import { AppMaterialModule } from '../shared/app-material.module';

@NgModule({
  declarations: [
    ManagerComponent,
    ClientsComponent
  ],
  imports: [
    CommonModule,
    ManagerRoutingModule,
    AppMaterialModule
  ]
})
export class ManagerModule { }
