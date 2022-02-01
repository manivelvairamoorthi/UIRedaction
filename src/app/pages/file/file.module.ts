import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileComponent } from './file.component';
import { MaterialModule } from 'src/app/shared/material.module';
import { FileDragDropDirective } from 'src/app/file-drag-drop.directive';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    FileComponent,
    FileDragDropDirective
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]

})
export class FileModule { }
