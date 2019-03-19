import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AppMaterialModule } from '../shared/app-material.module';
import { PacksComponent } from './packs/packs.component';
import { ClientAddComponent } from './client-add/client-add.component';

@NgModule({
  declarations: [
    AdminComponent,
    PacksComponent,
    ClientAddComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    AppMaterialModule
  ]
})
export class AdminModule { }
