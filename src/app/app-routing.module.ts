import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuardService } from './shared/auth-guard.service';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full'},
  {
    path: 'superadmin',
    loadChildren: './super-admin/super-admin.module#SuperAdminModule',
    canLoad: [AuthGuardService],
    canActivate: [AuthGuardService]
  },
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
