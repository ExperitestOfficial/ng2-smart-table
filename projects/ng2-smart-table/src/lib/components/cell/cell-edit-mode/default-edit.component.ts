import {Component} from '@angular/core';

import {EditCellDefault} from './edit-cell-default';

@Component({
  selector: 'table-cell-default-editor',
  templateUrl: './default-edit.component.html',
})
export class DefaultEditComponent<T extends object, C, D extends keyof T> extends EditCellDefault<T, C, D> {

  constructor() {
    super();
  }

  getEditorType(): string {
    return this.cell.getColumn().editor && this.cell.getColumn().editor.type;
  }
}
