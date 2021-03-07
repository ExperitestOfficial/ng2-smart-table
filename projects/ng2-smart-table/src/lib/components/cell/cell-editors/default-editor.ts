import { Component, Output, EventEmitter, Input } from '@angular/core';

import { Cell } from '../../../lib/data-set/cell';

@Component({
  template: '',
})
export class DefaultEditor<T extends object, C, D extends keyof T> implements Editor<T, C, D> {
  @Input() cell: Cell<T, C, D>;
  @Input() inputClass: string;

  @Output() onStopEditing = new EventEmitter<any>();
  @Output() onEdited = new EventEmitter<any>();
  @Output() onClick = new EventEmitter<any>();
}

export interface Editor<T extends object, C, D extends keyof T> {
  cell: Cell<T, C, D>;
  inputClass: string;
  onStopEditing: EventEmitter<any>;
  onEdited: EventEmitter<any>;
  onClick: EventEmitter<any>;
}
