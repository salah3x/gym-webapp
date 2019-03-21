import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppMaterialModule } from './app-material.module';

@NgModule({
  declarations: [],
  exports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    AppMaterialModule
  ]
})
export class SharedModule { }
