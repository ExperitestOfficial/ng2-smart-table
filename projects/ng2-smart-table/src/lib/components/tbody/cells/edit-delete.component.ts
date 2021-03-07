import {Component, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy} from '@angular/core';

import {ConfirmResponse, Grid} from '../../../lib/grid';
import {Row} from '../../../lib/data-set/row';
import {DataSource} from '../../../lib/data-source/data-source';

@Component({
  selector: 'ng2-st-tbody-edit-delete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="line-block">
      <button *ngIf="isActionEdit" [innerHTML]="editRowButtonContent" class="action-button" (click)="onEdit($event)"></button>
      <button *ngIf="isActionDelete" [innerHTML]="deleteRowButtonContent" class="action-button" (click)="onDelete($event)"></button>
    </div>
  `
})
export class TbodyEditDeleteComponent<T extends object> implements OnChanges {

  @Input() grid: Grid<T>;
  @Input() row: Row<T>;
  @Input() source: DataSource<T>;
  @Input() deleteConfirm: EventEmitter<ConfirmResponse<T>>;
  @Input() editConfirm: EventEmitter<unknown>;

  @Output() edit = new EventEmitter<{data: T, source: DataSource<T>}>();
  @Output() delete = new EventEmitter<{data: T, source: DataSource<T>}>();
  @Output() editRowSelect = new EventEmitter<Row<T>>();

  isActionEdit: boolean;
  isActionDelete: boolean;
  editRowButtonContent: string;
  deleteRowButtonContent: string;

  onEdit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.editRowSelect.emit(this.row);

    if (this.grid.getSetting('mode') === 'external') {
      this.edit.emit({
        data: this.row.getData(),
        source: this.source,
      });
    } else {
      this.grid.edit(this.row);
    }
  }

  onDelete(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.grid.getSetting('mode') === 'external') {
      this.delete.emit({
        data: this.row.getData(),
        source: this.source,
      });
    } else {
      this.grid.delete(this.row, this.deleteConfirm);
    }
  }

  ngOnChanges(): void {
    this.isActionEdit = this.grid.getSetting('actions.edit');
    this.isActionDelete = this.grid.getSetting('actions.delete');
    this.editRowButtonContent = this.grid.getSetting('edit.editButtonContent');
    this.deleteRowButtonContent = this.grid.getSetting('delete.deleteButtonContent');
  }
}
