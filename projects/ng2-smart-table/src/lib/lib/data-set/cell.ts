import { Column } from './column';
import { DataSet } from './data-set';
import { Row } from './row';

export function prepareValue<T>(value: T) { return value; }

export class Cell<T extends object, D, C extends keyof  T> {

  constructor(protected value: any, protected row: Row<T>, protected column: any, protected dataSet: DataSet<T>) {
    this.newValue = value;
  }
  protected static PREPARE = prepareValue;

  newValue: any = '';

  getColumn(): Column<T, D, C> {
    return this.column;
  }

  getRow(): Row<T> {
    return this.row;
  }

  getValue(): any {
    const valid = this.column.getValuePrepareFunction() instanceof Function;
    const prepare = valid ? this.column.getValuePrepareFunction() : Cell.PREPARE;
    return prepare.call(null, this.value, this.row.getData(), this);
  }

  setValue(value: any): any {
    this.newValue = value;
  }

  getId(): keyof T {
    return this.getColumn().id;
  }

  getTitle(): string {
    return this.getColumn().title;
  }

  isEditable(): boolean {
    if (this.getRow().index === -1) {
      return this.getColumn().isAddable;
    }
    else {
      return this.getColumn().isEditable;
    }
  }

}
