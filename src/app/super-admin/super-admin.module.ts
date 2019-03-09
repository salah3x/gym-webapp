import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminComponent } from './super-admin.component';
import { UsersComponent } from './users/users.component';
import { SuperAdminRoutingModule } from './super-admin-routing.module';

@NgModule({
  declarations: [
    SuperAdminComponent,
    UsersComponent
  ],
  imports: [
    CommonModule,
    SuperAdminRoutingModule
  ]
})
export class SuperAdminModule { }
