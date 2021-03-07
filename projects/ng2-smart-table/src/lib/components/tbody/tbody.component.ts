import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';

import {ConfirmResponse, Grid} from '../../lib/grid';
import {DataSource} from '../../lib/data-source/data-source';
import {Cell} from '../../lib/data-set/cell';
import {Row} from '../../lib/data-set/row';
import {SmartTableEventRow} from '../../ng2-smart-table.component';
import {CustomActionEvent} from './cells/custom.component';

@Component({
  selector: '[ng2-st-tbody]',
  styleUrls: ['./tbody.component.scss'],
  templateUrl: './tbody.component.html',
})
export class Ng2SmartTableTbodyComponent<T extends object> implements OnChanges {

  @Input() grid: Grid<T>;
  @Input() source: DataSource<T>;
  @Input() deleteConfirm: EventEmitter<ConfirmResponse<T>>;
  @Input() editConfirm: EventEmitter<unknown>;
  @Input() rowClassFunction: (row: SmartTableEventRow<T>) => string;
  @Input() isVirtualScrolling: boolean;

  @Output() save = new EventEmitter<Row<T>>();
  @Output() cancel = new EventEmitter<Row<T>>();
  @Output() edit = new EventEmitter<Row<T>>();
  @Output() delete = new EventEmitter<Row<T>>();
  @Output() custom = new EventEmitter<CustomActionEvent<T>>();
  @Output() edited = new EventEmitter<Row<T>>();
  @Output() userSelectRow = new EventEmitter<Row<T>>();
  @Output() editRowSelect = new EventEmitter<Row<T>>();
  @Output() multipleSelectRow = new EventEmitter<Row<T>>();
  @Output() rowHover = new EventEmitter<Row<T>>();

  isMultiSelectVisible: boolean;
  showActionColumnLeft: boolean;
  showActionColumnRight: boolean;
  mode: string;
  editInputClass: string;
  isActionAdd: boolean;
  isActionEdit: boolean;
  isActionDelete: boolean;
  noDataMessage: boolean;

  get tableColumnsCount(): number {
    const actionColumns = this.isActionAdd || this.isActionEdit || this.isActionDelete ? 1 : 0;
    return this.grid.getColumns().length + actionColumns;
  }

  ngOnChanges(): void {
    this.isMultiSelectVisible = this.grid.isMultiSelectVisible();
    this.showActionColumnLeft = this.grid.showActionColumn('left');
    this.mode = this.grid.getSetting('mode');
    this.editInputClass = this.grid.getSetting('edit.inputClass');
    this.showActionColumnRight = this.grid.showActionColumn('right');
    this.isActionAdd = this.grid.getSetting('actions.add');
    this.isActionEdit = this.grid.getSetting('actions.edit');
    this.isActionDelete = this.grid.getSetting('actions.delete');
    this.noDataMessage = this.grid.getSetting('noDataMessage');
  }

  getVisibleCells(cells: Cell<T, unknown, keyof T>[]): Cell<T, unknown, keyof T>[] {
    return (cells || []).filter((cell: Cell<T, unknown, keyof T>) => !cell.getColumn().hide);
  }

  onMultiRowClick($event: MouseEvent, row: Row<T>) {
    // $event.stopImmediatePropagation();
    $event.stopPropagation();
    this.multipleSelectRow.emit(row);
  }
}
