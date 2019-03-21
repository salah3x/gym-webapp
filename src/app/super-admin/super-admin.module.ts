import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { SuperAdminComponent } from './super-admin.component';
import { UsersComponent } from './users/users.component';
import { SuperAdminRoutingModule } from './super-admin-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    SuperAdminComponent,
    UsersComponent
  ],
  imports: [
    SharedModule,
    HttpClientModule,
    SuperAdminRoutingModule
  ]
})
export class SuperAdminModule { }
