import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/shared/material.module';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user.component';



@NgModule({
  declarations: [
    UserComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class UserModule { }
