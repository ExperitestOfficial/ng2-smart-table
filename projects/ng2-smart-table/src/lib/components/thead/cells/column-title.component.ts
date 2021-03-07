import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Column } from '../../../lib/data-set/column';
import { DataSource } from '../../../lib/data-source/data-source';

@Component({
  selector: 'ng2-st-column-title',
  template: `
    <div class="ng2-smart-title">
      <ng2-smart-table-title [source]="source" [column]="column" (sort)="sort.emit($event)"></ng2-smart-table-title>
    </div>
  `,
})
export class ColumnTitleComponent<T extends object> {

  @Input() column: Column<T, unknown, keyof T>;
  @Input() source: DataSource<T>;

  @Output() sort = new EventEmitter<void>();

}
