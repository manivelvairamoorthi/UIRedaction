import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { MaterialModule } from 'src/app/shared/material.module';


PlotlyModule.plotlyjs = PlotlyJS;




@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    PlotlyModule,
    MaterialModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
