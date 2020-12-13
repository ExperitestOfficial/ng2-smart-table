import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';

import { routes } from './documentation.routes';

import { DocumentationComponent } from './documentation.component';
//Lingar comment
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
  ],
  declarations: [
    DocumentationComponent,
  ],
})
export class DocumentationModule { }
