import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminComponent } from './super-admin.component';
import { UsersComponent } from './users/users.component';
import { SuperAdminRoutingModule } from './super-admin-routing.module';
import { AppMaterialModule } from '../shared/app-material.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    SuperAdminComponent,
    UsersComponent
  ],
  imports: [
    CommonModule,
    SuperAdminRoutingModule,
    AppMaterialModule,
    HttpClientModule
  ]
})
export class SuperAdminModule { }
