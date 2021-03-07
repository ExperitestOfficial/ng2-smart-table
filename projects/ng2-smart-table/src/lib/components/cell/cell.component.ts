import { Component, Input, Output, EventEmitter } from '@angular/core';

import {ConfirmResponse, Grid} from '../../lib/grid';
import { Cell } from '../../lib/data-set/cell';
import { Row } from '../../lib/data-set/row';

@Component({
  selector: 'ng2-smart-table-cell',
  template: `
    <table-cell-view-mode *ngIf="!isInEditing || !cell.isEditable()" [cell]="cell"></table-cell-view-mode>
    <table-cell-edit-mode *ngIf="isInEditing && cell.isEditable()" [cell]="cell"
                          [inputClass]="inputClass"
                          (edited)="onEdited()">
    </table-cell-edit-mode>
  `,
})
export class CellComponent<T extends object, C, D extends keyof T> {

  @Input() grid: Grid<T>;
  @Input() row: Row<T>;
  @Input() editConfirm: EventEmitter<ConfirmResponse<T>>;
  @Input() createConfirm: EventEmitter<ConfirmResponse<T>>;
  @Input() isNew: boolean;
  @Input() cell: Cell<T, C, D>;
  @Input() inputClass = '';
  @Input() mode = 'inline';
  @Input() isInEditing = false;

  @Output() edited = new EventEmitter<any>();

  onEdited(): void {
    if (this.isNew) {
      this.grid.create(this.grid.getNewRow(), this.createConfirm);
    } else {
      this.grid.save(this.row, this.editConfirm);
    }
  }
}
