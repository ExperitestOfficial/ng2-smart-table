import { Input, Output, EventEmitter, OnDestroy, Component } from '@angular/core';
import { Subscription } from 'rxjs';

import { Column } from '../../../lib/data-set/column';

@Component({
  template: '',
})
export class DefaultFilter<T extends object> implements Filter<T>, OnDestroy {

  delay = 300;
  changesSubscription: Subscription;
  @Input() query: string | boolean;
  @Input() inputClass: string;
  @Input() column: Column<T, unknown, keyof T>;
  @Output() filter = new EventEmitter<string | boolean>();

  ngOnDestroy() {
    if (this.changesSubscription) {
      this.changesSubscription.unsubscribe();
    }
  }

  setFilter() {
    this.filter.emit(this.query);
  }
}

export interface Filter<T extends object> {

  delay?: number;
  changesSubscription?: Subscription;
  query: string | boolean;
  inputClass: string;
  column: Column<T, unknown, keyof T>;
  filter: EventEmitter<string | boolean>;
}
