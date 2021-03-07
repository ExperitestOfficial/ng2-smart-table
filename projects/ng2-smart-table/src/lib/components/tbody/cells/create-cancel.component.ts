import {Component, Input, EventEmitter, OnChanges} from '@angular/core';

import {ConfirmResponse, Grid} from '../../../lib/grid';
import {Row} from '../../../lib/data-set/row';

@Component({
  selector: 'ng2-st-tbody-create-cancel',
  template: `
    <div class="line-block">
      <button [innerHTML]="saveButtonContent" class="action-button" (click)="onSave($event)"></button>
      <button [innerHTML]="cancelButtonContent" class="cancel-button" (click)="onCancelEdit($event)"></button>
    </div>
  `,
})
export class TbodyCreateCancelComponent<T extends object> implements OnChanges {

  @Input() grid: Grid<T>;
  @Input() row: Row<T>;
  @Input() editConfirm: EventEmitter<ConfirmResponse<T>>;

  cancelButtonContent: string;
  saveButtonContent: string;

  onSave(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.grid.save(this.row, this.editConfirm);
  }

  onCancelEdit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.row.isInEditing = false;
  }

  ngOnChanges(): void {
    this.saveButtonContent = this.grid.getSetting('edit.saveButtonContent');
    this.cancelButtonContent = this.grid.getSetting('edit.cancelButtonContent');
  }
}
