import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Row} from '../../../lib/data-set/row';

import {Grid} from '../../../lib/grid';

import {DataSource} from '../../../lib/data-source/data-source';
import {CustomST2Button} from '../../../../lib/ng2-smart-table.component';

export interface CustomActionEvent<T extends object> {
  action: string;
  data: T;
  source: DataSource<T>;
}

@Component({
  selector: 'ng2-st-tbody-custom',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button *ngFor="let action of grid.getSetting('actions.custom')" href="#"
            class="custom-button"
            [innerHTML]="action.title"
            (click)="onCustom(action, $event)"></button>
  `
})
export class TbodyCustomComponent<T extends object> {

  @Input() grid: Grid<T>;
  @Input() row: Row<T>;
  @Input() source: DataSource<T>;
  @Output() custom = new EventEmitter<CustomActionEvent<T>>();

  onCustom(action: CustomST2Button, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.custom.emit({
      action: action.name,
      data: this.row.getData(),
      source: this.source
    });
  }

}
