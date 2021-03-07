import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

import {Cell} from '../../../lib/data-set/cell';

@Component({
  selector: 'table-cell-view-mode',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngSwitch]="cell.getColumn().type">
      <custom-view-component *ngSwitchCase="'custom'" [cell]="cell"></custom-view-component>
      <div *ngSwitchCase="'html'" [innerHTML]="cell.getValue()"></div>
      <div *ngSwitchDefault>{{ cell.getValue() }}</div>
    </div>
  `,
})
export class ViewCellComponent<T extends object, C, D extends keyof T> {

  @Input() cell: Cell<T, C, D>;
}

/*
  //ng2-smart-table//getcolumn//getrow//table-cell-view-mode/div/div
 */
