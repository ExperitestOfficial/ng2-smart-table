import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import {ConfirmResponse, Grid} from '../../../lib/grid';
import { Row } from '../../../lib/data-set/row';
import { Cell } from '../../../lib/data-set/cell';

@Component({
  selector: '[ng2-st-thead-form-row]',
  template: `
      <td  *ngIf="showActionColumnLeft"  class="ng2-smart-actions">
        <ng2-st-actions [grid]="grid" (create)="onCreate($event)"></ng2-st-actions>
      </td>
      <td *ngFor="let cell of getVisibleCells(grid.getNewRow().getCells())">
        <ng2-smart-table-cell [cell]="cell"
                              [grid]="grid"
                              [isNew]="true"
                              [createConfirm]="createConfirm"
                              [inputClass]="addInputClass"
                              [isInEditing]="grid.getNewRow().isInEditing"
                              (edited)="onCreate($event)">
        </ng2-smart-table-cell>
      </td>
      <td  *ngIf="showActionColumnRight"  class="ng2-smart-actions">
        <ng2-st-actions [grid]="grid" (create)="onCreate($event)"></ng2-st-actions>
      </td>
  `,
})
export class TheadFormRowComponent<T extends object> implements OnChanges {

  @Input() grid: Grid<T>;
  @Input() row: Row<T>;
  @Input() createConfirm: EventEmitter<ConfirmResponse<T>>;

  @Output() create = new EventEmitter<ConfirmResponse<T>>();

  isMultiSelectVisible: boolean;
  showActionColumnLeft: boolean;
  showActionColumnRight: boolean;
  addInputClass: string;

  onCreate(event: Event): void {
    event.stopPropagation();
    this.grid.create(this.grid.getNewRow(), this.createConfirm);
  }

  ngOnChanges(): void {
    this.isMultiSelectVisible = this.grid.isMultiSelectVisible();
    this.showActionColumnLeft = this.grid.showActionColumn('left');
    this.showActionColumnRight = this.grid.showActionColumn('right');
    this.addInputClass = this.grid.getSetting('add.inputClass');
  }

  getVisibleCells(cells: Cell<T, unknown, keyof T>[]): Cell<T, unknown, keyof T>[] {
    return (cells || []).filter((cell: Cell<T, unknown, keyof T>) => !cell.getColumn().hide);
  }
}
