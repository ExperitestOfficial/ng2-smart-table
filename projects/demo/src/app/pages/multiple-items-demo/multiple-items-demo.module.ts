import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Ng2SmartTableModule} from 'ng2-smart-table';
import {routes} from '../multiple-items-demo/multiple-items-demo.routes';
import {SharedModule} from '../../shared/shared.module';
import {MultipleItemsDemoComponent} from './multiple-items-demo.component';
import {St2CellDataComponent} from './st2-cell-data.component.';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    Ng2SmartTableModule
  ],
  declarations: [
    MultipleItemsDemoComponent, St2CellDataComponent
  ],
})
export class MultipleItemsDemoModule { }
