import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminComponent } from './super-admin.component';
import { UsersComponent } from './users/users.component';
import { SuperAdminRoutingModule } from './super-admin-routing.module';
import { AppMaterialModule } from '../shared/app-material.module';

@NgModule({
  declarations: [
    SuperAdminComponent,
    UsersComponent
  ],
  imports: [
    CommonModule,
    SuperAdminRoutingModule,
    AppMaterialModule
  ]
})
export class SuperAdminModule { }
