import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { AppMaterialModule } from './app-material.module';
import { PhotoUploadComponent } from './photo-upload/photo-upload.component';

@NgModule({
  declarations: [PhotoUploadComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    AppMaterialModule,
    AngularFireStorageModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    AppMaterialModule,
    PhotoUploadComponent
  ]
})
export class SharedModule {}
