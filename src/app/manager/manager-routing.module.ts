import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagerComponent } from './manager.component';
import { ClientsComponent } from './clients/clients.component';
import { ProfileComponent } from './clients/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: ManagerComponent,
    children: [
      {path: '', redirectTo: 'clients', pathMatch: 'full'},
      {path: 'clients', component: ClientsComponent},
      {path: 'clients/:id', component: ProfileComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule { }
