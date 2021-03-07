import { Output, EventEmitter, Input, Component } from '@angular/core';

import { Column } from '../../lib/data-set/column';
import { DataSource } from '../../lib/data-source/data-source';

@Component({
  template: '',
})
export class FilterDefault<T extends object> {

  @Input() column: Column<T, unknown, keyof T>;
  @Input() source: DataSource<T>;
  @Input() inputClass = '';

  @Output() filter = new EventEmitter<string>();

  query = '';

  onFilter(query: string): void {
    this.source.addFilter({
      field: this.column.id,
      search: query,
      filter: this.column.getFilterFunction(),
    });
  }
}
