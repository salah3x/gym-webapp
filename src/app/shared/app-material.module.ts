import {NgModule} from '@angular/core';
import {
  MatButtonModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatMenuModule,
  MatTooltipModule,
  MatToolbarModule,
  MatDialogModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatSnackBarModule
} from '@angular/material';

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatMenuModule,
    MatTooltipModule,
    MatToolbarModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  exports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatMenuModule,
    MatTooltipModule,
    MatToolbarModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
})
export class AppMaterialModule { }
