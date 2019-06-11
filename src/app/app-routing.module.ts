import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthGuardService } from './shared/auth-guard.service';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full'},
  {
    path: 'superadmin',
    loadChildren: () => import('./super-admin/super-admin.module').then(m => m.SuperAdminModule),
    canLoad: [AuthGuardService],
    canActivate: [AuthGuardService]
  },
  {
    path: 'manager',
    loadChildren: () => import('./manager/manager.module').then(m => m.ManagerModule),
    canLoad: [AuthGuardService],
    canActivate: [AuthGuardService]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
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
